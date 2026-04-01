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
const EXTRACTS_BASE = "https://api.sam.gov/entity-information/v3/extracts";
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
  // The Extracts API returns metadata about available extract files
  const url = `${EXTRACTS_BASE}?api_key=${SAM_API_KEY}&fileType=ENTITY`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Extracts API error ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json() as {
    extractFiles?: Array<{
      fileName?: string;
      fileDate?: string;
      _links?: { self?: { href?: string } };
    }>;
  };

  const files = data.extractFiles ?? [];
  if (files.length === 0) throw new Error("No extract files available");

  // Get the most recent file
  const latest = files[0];
  const downloadUrl = latest._links?.self?.href ?? "";
  if (!downloadUrl) throw new Error("No download URL in extract response");

  return {
    fileName: latest.fileName ?? "sam_extract.zip",
    fileDate: latest.fileDate ?? "unknown",
    downloadUrl,
  };
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
  const fullUrl = downloadUrl.startsWith("http") ? downloadUrl : `https://api.sam.gov${downloadUrl}?api_key=${SAM_API_KEY}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const fileStream = createWriteStream(localPath);
  await pipeline(res.body as unknown as NodeJS.ReadableStream, fileStream);
  const stat = fs.statSync(localPath);
  console.log(`  Downloaded: ${(stat.size / 1024 / 1024).toFixed(0)}MB`);
  return localPath;
}

// SAM.gov CSV column indices (from the Entity Extract documentation)
// The extract is a pipe-delimited (|) CSV with fixed columns
const COL = {
  UEI: 0,
  CAGE_CODE: 1,
  LEGAL_NAME: 2,
  DBA_NAME: 3,
  REGISTRATION_DATE: 8,
  EXPIRATION_DATE: 9,
  ENTITY_STRUCTURE: 13,
  STATE: 23,
  ZIP: 24,
  CITY: 22,
  STREET: 21,
  WEBSITE: 28,
  NAICS_PRIMARY: 32,
  NAICS_LIST: 33,
  BUSINESS_TYPES: 34,
  SBA_TYPES: 35,
  CONTACT_FIRST: 44,
  CONTACT_LAST: 45,
  CONTACT_EMAIL: 47,
  EIN: 77,
} as const;

async function processExtractZip(zipPath: string): Promise<number> {
  let processed = 0;
  let saved = 0;
  let batch: Parameters<typeof prisma.company.upsert>[0]["create"][] = [];
  const BATCH_SIZE = 500;

  const flushBatch = async () => {
    if (batch.length === 0) return;
    await Promise.allSettled(
      batch.map((data) =>
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
            contactEmail: data.contactEmail,
            naicsCodes: data.naicsCodes,
            naicsPrimary: data.naicsPrimary,
            businessTypes: data.businessTypes,
            sbaDesignations: data.sbaDesignations,
            entityStructure: data.entityStructure,
            registrationDate: data.registrationDate,
            isActive: true,
          },
        })
      )
    );
    saved += batch.length;
    batch = [];
  };

  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.ParseOne(/\.csv$/i))
      .pipe(
        parse({
          delimiter: "|",
          skip_empty_lines: true,
          from_line: 2, // skip header row
          relax_column_count: true,
        })
      )
      .on("data", async (row: string[]) => {
        processed++;

        const naicsPrimary = row[COL.NAICS_PRIMARY]?.trim();
        if (!shouldKeep(naicsPrimary)) return; // skip non-target sectors

        const expirationDate = row[COL.EXPIRATION_DATE]?.trim();
        if (expirationDate && new Date(expirationDate) < new Date()) return; // skip expired

        const uei = row[COL.UEI]?.trim();
        const legalName = row[COL.LEGAL_NAME]?.trim();
        if (!uei || !legalName) return;

        const naicsListRaw = row[COL.NAICS_LIST]?.trim() ?? "";
        const naicsCodes = naicsListRaw.split("~").map((s) => s.trim()).filter(Boolean);

        const businessTypesRaw = row[COL.BUSINESS_TYPES]?.trim() ?? "";
        const businessTypes = businessTypesRaw.split("~").map((s) => s.trim()).filter(Boolean);

        const sbaRaw = row[COL.SBA_TYPES]?.trim() ?? "";
        const sbaDesignations = sbaRaw.split("~").map((s) => s.trim()).filter(Boolean);

        const contactFirst = row[COL.CONTACT_FIRST]?.trim() ?? "";
        const contactLast = row[COL.CONTACT_LAST]?.trim() ?? "";
        const contactName = [contactFirst, contactLast].filter(Boolean).join(" ") || null;

        const regDateRaw = row[COL.REGISTRATION_DATE]?.trim();
        const registrationDate = regDateRaw ? new Date(regDateRaw) : null;

        batch.push({
          uei,
          legalName,
          dbaName: row[COL.DBA_NAME]?.trim() || null,
          ein: row[COL.EIN]?.trim() || null,
          cageCode: row[COL.CAGE_CODE]?.trim() || null,
          streetAddress: row[COL.STREET]?.trim() || null,
          city: row[COL.CITY]?.trim() || null,
          state: row[COL.STATE]?.trim() || null,
          zipCode: row[COL.ZIP]?.trim() || null,
          website: row[COL.WEBSITE]?.trim() || null,
          contactName,
          contactEmail: row[COL.CONTACT_EMAIL]?.trim() || null,
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

        if (batch.length >= BATCH_SIZE) {
          await flushBatch();
          if (saved % 5000 === 0 && saved > 0) {
            console.log(`  Progress: ${processed.toLocaleString()} rows scanned, ${saved.toLocaleString()} saved`);
          }
        }
      })
      .on("end", async () => {
        await flushBatch();
        resolve(saved);
      })
      .on("error", reject);
  });
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
