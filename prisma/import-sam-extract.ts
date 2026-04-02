/**
 * SAM.gov Entity Extracts Importer — BULK approach (recommended)
 * ---------------------------------------------------------------
 * Downloads the monthly SAM.gov Entity Extract ZIP file which contains
 * ALL active registered entities — no per-request quota issues.
 *
 * The free API key (10 requests/day) is NOT suitable for the NAICS-by-NAICS
 * query approach. The Extracts API is designed exactly for bulk import.
 *
 * Usage:
 *   npm run import:sam-extract
 *
 * What it does:
 *   1. Calls the Extracts API to get the download URL for this month's file
 *   2. Downloads the ZIP (can be 200MB–1GB)
 *   3. Streams + parses the CSV inside the ZIP
 *   4. Filters to NAICS codes matching Career Compass sectors
 *   5. Upserts into Company table
 *
 * The monthly extract is available on the 1st of each month.
 * For incremental updates, re-run monthly or use import-sam-companies.ts
 * (NAICS query) for small targeted pulls within the 10 req/day quota.
 *
 * Docs: https://open.gsa.gov/api/sam-entity-extracts-api/
 */

import { config } from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { PrismaClient } from "../src/generated/prisma";
import pg from "pg";
import unzipper from "unzipper";
import { parse } from "csv-parse";

config({ path: path.join(__dirname, "../.env") });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter: new (require("@prisma/adapter-pg").PrismaPg)(pool),
});

const SAM_API_KEY = process.env.SAM_GOV_API_KEY;
const EXTRACTS_BASE = "https://api.sam.gov/data-services/v1/extracts";
const CACHE_DIR = path.join(os.homedir(), ".webcrawler", "sam-extracts");

// NAICS prefixes to keep — one per Career Compass sector (4-digit prefix match)
const KEEP_NAICS_PREFIXES = new Set([
  "5415", "5112", "5182",  // Technology
  "5418",                   // Marketing
  "5221", "5231", "5241",  // Financial Services
  "6211", "6212", "6216",  // Healthcare
  "5411",                   // Legal
  "6113", "6114",          // Education
  "5312", "5313",          // Real Estate
  "5613",                   // HR & Staffing
  "4841", "4922",          // Logistics
  "5151", "5191",          // Media
  "5416", "5412",          // Professional Services
]);

function shouldKeep(naicsCode?: string): boolean {
  if (!naicsCode) return false;
  const prefix = naicsCode.slice(0, 4);
  return KEEP_NAICS_PREFIXES.has(prefix);
}

interface ExtractFileInfo {
  fileName: string;
  fileDate: string;
  downloadUrl: string;
}

async function getExtractDownloadUrl(): Promise<ExtractFileInfo> {
  // The Extracts API: fileType=ENTITY, sensitivity=PUBLIC, frequency=MONTHLY
  // Returns a redirect to the actual download URL
  const params = new URLSearchParams({
    api_key: SAM_API_KEY!,
    fileType: "ENTITY",
    sensitivity: "PUBLIC",
    frequency: "MONTHLY",
  });
  const url = `${EXTRACTS_BASE}?${params.toString()}`;

  const res = await fetch(url, { redirect: "manual" });

  // API returns 200 with download URL or 302 redirect directly to file
  if (res.status === 302 || res.status === 301) {
    const location = res.headers.get("location") ?? "";
    if (!location) throw new Error("Redirect with no Location header");
    const fileName = location.split("/").pop()?.split("?")[0] ?? "sam_extract.zip";
    return { fileName, fileDate: "current", downloadUrl: location };
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Extracts API error ${res.status}: ${text.slice(0, 300)}`);
  }

  // Some responses return JSON with a download link
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = await res.json() as {
      extractFiles?: Array<{ fileName?: string; fileDate?: string; _links?: { self?: { href?: string } } }>;
      fileName?: string;
      fileDownloadLink?: string;
      s3FileUrl?: string;
    };
    // Try various response shapes
    const files = data.extractFiles ?? [];
    if (files.length > 0) {
      const latest = files[0];
      const downloadUrl = latest._links?.self?.href ?? "";
      if (!downloadUrl) throw new Error("No download URL in extract response");
      return {
        fileName: latest.fileName ?? "sam_extract.zip",
        fileDate: latest.fileDate ?? "unknown",
        downloadUrl,
      };
    }
    const directUrl = data.fileDownloadLink ?? data.s3FileUrl ?? "";
    if (directUrl) {
      const fileName = data.fileName ?? directUrl.split("/").pop()?.split("?")[0] ?? "sam_extract.zip";
      return { fileName, fileDate: "current", downloadUrl: directUrl };
    }
    throw new Error(`Unexpected JSON response: ${JSON.stringify(data).slice(0, 300)}`);
  }

  // If it's the ZIP itself (content-disposition), the URL is the download URL
  throw new Error(`Unexpected response content-type: ${contentType}`);
}

async function downloadExtract(downloadUrl: string, fileName: string): Promise<string> {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const localPath = path.join(CACHE_DIR, fileName);

  if (fs.existsSync(localPath)) {
    const stat = fs.statSync(localPath);
    const ageHours = (Date.now() - stat.mtimeMs) / 3600000;
    if (ageHours < 168) { // Use cached file if less than 7 days old
      console.log(`  Using cached file: ${localPath} (${(stat.size / 1024 / 1024).toFixed(0)}MB)`);
      return localPath;
    }
  }

  console.log(`  Downloading: ${fileName}...`);
  // If URL already has api_key or is a pre-signed S3 URL, use as-is; otherwise append key
  const fullUrl = (downloadUrl.includes("api_key=") || downloadUrl.includes("X-Amz-"))
    ? downloadUrl
    : downloadUrl.startsWith("http")
      ? `${downloadUrl}${downloadUrl.includes("?") ? "&" : "?"}api_key=${SAM_API_KEY}`
      : `https://api.sam.gov${downloadUrl}?api_key=${SAM_API_KEY}`;
  const res = await fetch(fullUrl, { redirect: "follow" });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const fileStream = createWriteStream(localPath);
  await pipeline(res.body as unknown as NodeJS.ReadableStream, fileStream);
  const stat = fs.statSync(localPath);
  console.log(`  Downloaded: ${(stat.size / 1024 / 1024).toFixed(0)}MB`);
  return localPath;
}

// SAM.gov Public Monthly Extract V2 column indices (verified against actual extract)
// Format: pipe-delimited (|), 142 columns, starts with BOF header row
const COL = {
  UEI: 0,
  CAGE_CODE: 3,
  LEGAL_NAME: 11,
  DBA_NAME: 12,
  REGISTRATION_DATE: 7,
  EXPIRATION_DATE: 8,
  ENTITY_STRUCTURE: 27,  // entity structure code (e.g. "ZZ", "2L")
  CITY: 17,
  STATE: 18,
  ZIP: 19,
  STREET: 15,
  WEBSITE: 26,
  NAICS_PRIMARY: 32,
  NAICS_LIST: 34,     // ~-separated list with type suffix e.g. "541511Y~541512Y"
  BUSINESS_TYPES: 31, // ~-separated business type codes
  SBA_TYPES: 36,      // ~-separated SBA designation codes (empty if none)
  CONTACT_FIRST: 46,  // Electronic Business POC first name
  CONTACT_LAST: 48,   // Electronic Business POC last name
  // EIN and contact email not available in public extract (FOUO only)
} as const;

async function processExtractZip(zipPath: string): Promise<number> {
  // Phase 1: collect all matching rows synchronously (no async in stream handler)
  type CompanyRow = Parameters<typeof prisma.company.upsert>[0]["create"];
  const rows: CompanyRow[] = [];
  let processed = 0;

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.ParseOne(/\.(csv|dat|txt)$/i))
      .pipe(
        parse({
          delimiter: "|",
          skip_empty_lines: true,
          from_line: 2,
          relax_column_count: true,
          quote: false,
          relax_quotes: true,
        })
      )
      .on("data", (row: string[]) => {
        processed++;

        const naicsPrimary = row[COL.NAICS_PRIMARY]?.trim();
        if (!shouldKeep(naicsPrimary)) return;

        // SAM date format: YYYYMMDD → convert to YYYY-MM-DD for reliable parsing
        const parseSamDate = (s?: string) => {
          if (!s || s.length < 8) return null;
          const d = new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`);
          return isNaN(d.getTime()) ? null : d;
        };
        const expParsed = parseSamDate(row[COL.EXPIRATION_DATE]?.trim());
        if (expParsed && expParsed < new Date()) return; // skip expired

        const uei = row[COL.UEI]?.trim();
        const legalName = row[COL.LEGAL_NAME]?.trim();
        if (!uei || !legalName) return;

        const naicsListRaw = row[COL.NAICS_LIST]?.trim() ?? "";
        // Strip type suffix: "541511Y" → "541511", "541512E" → "541512"
        const naicsCodes = naicsListRaw.split("~").map((s) => s.trim().replace(/[A-Z]+$/, "")).filter(Boolean);

        const businessTypesRaw = row[COL.BUSINESS_TYPES]?.trim() ?? "";
        const businessTypes = businessTypesRaw.split("~").map((s) => s.trim()).filter(Boolean);

        const sbaRaw = row[COL.SBA_TYPES]?.trim() ?? "";
        const sbaDesignations = sbaRaw.split("~").map((s) => s.trim()).filter(Boolean);

        const contactFirst = row[COL.CONTACT_FIRST]?.trim() ?? "";
        const contactLast = row[COL.CONTACT_LAST]?.trim() ?? "";
        const contactName = [contactFirst, contactLast].filter(Boolean).join(" ") || null;

        const registrationDate = parseSamDate(row[COL.REGISTRATION_DATE]?.trim());

        rows.push({
          uei,
          legalName,
          dbaName: row[COL.DBA_NAME]?.trim() || null,
          ein: null, // not available in public extract
          cageCode: row[COL.CAGE_CODE]?.trim() || null,
          streetAddress: row[COL.STREET]?.trim() || null,
          city: row[COL.CITY]?.trim() || null,
          state: row[COL.STATE]?.trim() || null,
          zipCode: row[COL.ZIP]?.trim() || null,
          website: row[COL.WEBSITE]?.trim() || null,
          contactName,
          contactEmail: null, // not available in public extract
          naicsCodes,
          naicsPrimary,
          naicsDescription: null,
          businessTypes,
          sbaDesignations,
          entityStructure: row[COL.ENTITY_STRUCTURE]?.trim() || null,
          registrationDate,
          samRegistered: true,
          ocRegistered: false,
          isActive: true,
        });
      })
      .on("end", () => resolve())
      .on("error", reject);
  });

  console.log(`  Scanned ${processed.toLocaleString()} rows, ${rows.length.toLocaleString()} match NAICS filter`);

  // Phase 2: upsert in concurrent micro-batches of 5 (safe for Supabase pooler, ~5x faster than sequential)
  const CONCURRENCY = 5;
  const CHUNK = 500;
  let saved = 0;
  let firstError = true;

  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const micro = rows.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      micro.map((data) =>
        prisma.company.upsert({
          where: { uei: data.uei! },
          create: data,
          update: {
            legalName: data.legalName,
            dbaName: data.dbaName,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            website: data.website,
            contactName: data.contactName,
            naicsCodes: data.naicsCodes,
            naicsPrimary: data.naicsPrimary,
            businessTypes: data.businessTypes,
            sbaDesignations: data.sbaDesignations,
            entityStructure: data.entityStructure,
            registrationDate: data.registrationDate,
            samRegistered: true,
            isActive: true,
          },
        })
      )
    );
    for (const r of results) {
      if (r.status === "fulfilled") {
        saved++;
      } else if (firstError) {
        console.error("  Upsert error sample:", (r.reason as Error).message);
        firstError = false;
      }
    }
    if (saved % CHUNK === 0 && saved > 0) {
      console.log(`  Progress: ${saved.toLocaleString()} / ${rows.length.toLocaleString()} saved`);
    }
  }

  return saved;
}

async function main() {
  if (!SAM_API_KEY) {
    console.error("SAM_GOV_API_KEY not set in .env");
    process.exit(1);
  }

  console.log("SAM.gov Entity Extract Import (bulk — no quota issues)\n");

  // Check if a local ZIP was provided as argument (skip download)
  const localArg = process.argv.find((a) => a.startsWith("--file="));
  let zipPath: string;

  if (localArg) {
    zipPath = localArg.replace("--file=", "");
    console.log(`Using local file: ${zipPath}`);
  } else {
    console.log("Step 1: Getting extract file info from SAM.gov...");
    const extractInfo = await getExtractDownloadUrl();
    console.log(`  File: ${extractInfo.fileName} (dated ${extractInfo.fileDate})`);

    console.log("Step 2: Downloading extract ZIP...");
    zipPath = await downloadExtract(extractInfo.downloadUrl, extractInfo.fileName);
  }

  console.log("Step 3: Parsing CSV + importing matching companies...");
  console.log(`  Filtering to ${KEEP_NAICS_PREFIXES.size} NAICS prefixes (12 Career Compass sectors)`);

  const saved = await processExtractZip(zipPath);

  const total = await prisma.company.count({ where: { samRegistered: true } });
  console.log(`\nDone. Saved ${saved.toLocaleString()} companies from this extract.`);
  console.log(`Total SAM.gov companies in DB: ${total.toLocaleString()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
