/**
 * IRS BMF Import — Downloads and imports all ~1.8M tax-exempt organizations
 * from the IRS Exempt Organizations Business Master File (59 state CSV files).
 *
 * Run with: npm run import:irs-bmf
 *
 * Data source: https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf
 *
 * Each CSV has 28 columns: EIN, NAME, ICO, STREET, CITY, STATE, ZIP, GROUP,
 * SUBSECTION, AFFILIATION, CLASSIFICATION, RULING, DEDUCTIBILITY, FOUNDATION,
 * ACTIVITY, ORGANIZATION, STATUS, TAX_PERIOD, ASSET_CD, INCOME_CD, FILING_REQ_CD,
 * PF_FILING_REQ_CD, ACCT_PD, ASSET_AMT, INCOME_AMT, REVENUE_AMT, NTEE_CD, SORT_NAME
 */

import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { parse } from "csv-parse";
import { createReadStream } from "fs";
import { Readable } from "stream";
import path from "path";
import fs from "fs";
import https from "https";
import http from "http";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// All 50 US states + DC + territories with IRS BMF files
const STATE_CODES = [
  "al","ak","az","ar","ca","co","ct","dc","de","fl",
  "ga","hi","id","il","in","ia","ks","ky","la","me",
  "md","ma","mi","mn","ms","mo","mt","ne","nv","nh",
  "nj","nm","ny","nc","nd","oh","ok","or","pa","pr",
  "ri","sc","sd","tn","tx","ut","vt","va","wa","wv",
  "wi","wy",
];

// Additional IRS files not tied to a state
const EXTRA_FILES = ["eo1", "eo2", "eo3", "eo4"];

const IRS_BASE_URL = "https://www.irs.gov/pub/irs-soi";
const BATCH_SIZE = 2000;
const DOWNLOAD_DIR = path.join(process.env.HOME || process.env.USERPROFILE || ".", ".webcrawler", "irs-bmf");

// ─── Download helpers ────────────────────────────────────────────────────────

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(dest);
    const client = url.startsWith("https") ? https : http;

    client.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location!, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (e) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(e);
    });
  });
}

// ─── CSV parsing ─────────────────────────────────────────────────────────────

function parseIntOrNull(val: string | undefined): number | null {
  if (!val || val.trim() === "") return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function parseBigIntOrNull(val: string | undefined): bigint | null {
  if (!val || val.trim() === "") return null;
  try { return BigInt(val.trim()); } catch { return null; }
}

interface BmfRow {
  EIN: string;
  NAME: string;
  ICO: string;
  STREET: string;
  CITY: string;
  STATE: string;
  ZIP: string;
  GROUP: string;
  SUBSECTION: string;
  AFFILIATION: string;
  CLASSIFICATION: string;
  RULING: string;
  DEDUCTIBILITY: string;
  FOUNDATION: string;
  ACTIVITY: string;
  ORGANIZATION: string;
  STATUS: string;
  TAX_PERIOD: string;
  ASSET_CD: string;
  INCOME_CD: string;
  FILING_REQ_CD: string;
  PF_FILING_REQ_CD: string;
  ACCT_PD: string;
  ASSET_AMT: string;
  INCOME_AMT: string;
  REVENUE_AMT: string;
  NTEE_CD: string;
  SORT_NAME: string;
}

function mapBmfRow(row: BmfRow): Prisma.IrsOrganizationCreateManyInput {
  return {
    ein: row.EIN.replace(/-/g, "").padStart(9, "0"),
    name: row.NAME?.trim() || "UNKNOWN",
    sortName: row.SORT_NAME?.trim() || null,
    ico: row.ICO?.trim() || null,
    street: row.STREET?.trim() || null,
    city: row.CITY?.trim() || null,
    state: row.STATE?.trim() || null,
    zip: row.ZIP?.trim() || null,
    subsection: parseIntOrNull(row.SUBSECTION),
    affiliation: parseIntOrNull(row.AFFILIATION),
    classification: parseIntOrNull(row.CLASSIFICATION),
    ruling: row.RULING?.trim() || null,
    deductibility: parseIntOrNull(row.DEDUCTIBILITY),
    foundation: parseIntOrNull(row.FOUNDATION),
    activity: row.ACTIVITY?.trim() || null,
    organization: parseIntOrNull(row.ORGANIZATION),
    exemptStatus: parseIntOrNull(row.STATUS),
    taxPeriod: row.TAX_PERIOD?.trim() || null,
    assetCode: parseIntOrNull(row.ASSET_CD),
    incomeCode: parseIntOrNull(row.INCOME_CD),
    filingReqCode: parseIntOrNull(row.FILING_REQ_CD),
    pfFilingReqCode: parseIntOrNull(row.PF_FILING_REQ_CD),
    accountingPeriod: parseIntOrNull(row.ACCT_PD),
    assetAmount: parseBigIntOrNull(row.ASSET_AMT),
    incomeAmount: parseBigIntOrNull(row.INCOME_AMT),
    revenueAmount: parseBigIntOrNull(row.REVENUE_AMT),
    nteeCode: row.NTEE_CD?.trim() || null,
    groupNumber: row.GROUP?.trim() || null,
    bmfLastUpdated: new Date(),
  };
}

// ─── Import logic ────────────────────────────────────────────────────────────

async function importCsvFile(filePath: string, label: string): Promise<number> {
  let batch: Prisma.IrsOrganizationCreateManyInput[] = [];
  let total = 0;
  let skipped = 0;

  const parser = createReadStream(filePath).pipe(
    parse({ columns: true, skip_empty_lines: true, trim: true, relax_column_count: true })
  );

  for await (const row of parser as AsyncIterable<BmfRow>) {
    if (!row.EIN || row.EIN.trim() === "") {
      skipped++;
      continue;
    }

    batch.push(mapBmfRow(row));

    if (batch.length >= BATCH_SIZE) {
      await upsertBatch(batch);
      total += batch.length;
      process.stdout.write(`\r  [${label}] ${total.toLocaleString()} rows imported`);
      batch = [];
    }
  }

  // Final batch
  if (batch.length > 0) {
    await upsertBatch(batch);
    total += batch.length;
  }

  console.log(`\r  [${label}] ${total.toLocaleString()} rows imported (${skipped} skipped)`);
  return total;
}

async function upsertBatch(rows: Prisma.IrsOrganizationCreateManyInput[]) {
  // Use createMany with skipDuplicates for initial load, then raw SQL for updates
  try {
    await prisma.irsOrganization.createMany({
      data: rows,
      skipDuplicates: true,
    });
  } catch (e: any) {
    // If batch fails, try row-by-row upsert
    for (const row of rows) {
      try {
        await prisma.irsOrganization.upsert({
          where: { ein: row.ein! },
          create: row,
          update: {
            name: row.name,
            street: row.street,
            city: row.city,
            state: row.state,
            zip: row.zip,
            subsection: row.subsection,
            nteeCode: row.nteeCode,
            assetAmount: row.assetAmount,
            incomeAmount: row.incomeAmount,
            revenueAmount: row.revenueAmount,
            bmfLastUpdated: new Date(),
          },
        });
      } catch (rowErr: any) {
        // Skip individual row errors (e.g., duplicate EIN within same batch)
      }
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  IRS BMF Import — ~1.8M Tax-Exempt Organizations");
  console.log("═══════════════════════════════════════════════════════════");

  const allFiles = [
    ...STATE_CODES.map(s => `eo_${s}`),
    ...EXTRA_FILES,
  ];

  let grandTotal = 0;
  const startTime = Date.now();

  for (let i = 0; i < allFiles.length; i++) {
    const fileKey = allFiles[i];
    const csvPath = path.join(DOWNLOAD_DIR, `${fileKey}.csv`);

    // Download if not present
    if (!fs.existsSync(csvPath)) {
      const url = `${IRS_BASE_URL}/${fileKey}.csv`;
      console.log(`  Downloading ${fileKey}.csv...`);
      try {
        await downloadFile(url, csvPath);
      } catch (e: any) {
        console.log(`  [skip] ${fileKey}.csv: ${e.message}`);
        continue;
      }
    }

    const fileTotal = await importCsvFile(csvPath, `${i + 1}/${allFiles.length} ${fileKey}`);
    grandTotal += fileTotal;
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`  Done! ${grandTotal.toLocaleString()} organizations imported in ${elapsed} min`);
  console.log("═══════════════════════════════════════════════════════════");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
