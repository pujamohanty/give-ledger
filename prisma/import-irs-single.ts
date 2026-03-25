/**
 * Single-state IRS BMF importer.
 * Called by run-irs-states.sh — one Node process per state to avoid heap OOM.
 *
 * Usage: npx tsx prisma/import-irs-single.ts <fileKey>
 *   e.g. npx tsx prisma/import-irs-single.ts eo_ca
 */

import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { parse } from "csv-parse";
import { createReadStream } from "fs";
import path from "path";
import fs from "fs";
import https from "https";
import http from "http";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL is required"); process.exit(1); }

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const IRS_BASE_URL = "https://www.irs.gov/pub/irs-soi";
const BATCH_SIZE = 500; // smaller batches = lower peak memory per process
const DOWNLOAD_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE || ".",
  ".webcrawler", "irs-bmf"
);

const fileKey = process.argv[2];
if (!fileKey) { console.error("Usage: npx tsx prisma/import-irs-single.ts <fileKey>"); process.exit(1); }

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.dirname(dest))) fs.mkdirSync(path.dirname(dest), { recursive: true });
    const file = fs.createWriteStream(dest);
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); fs.unlinkSync(dest);
        return downloadFile(res.headers.location!, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close(); fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (e) => { file.close(); fs.unlink(dest, () => {}); reject(e); });
  });
}

function parseIntOrNull(v: string | undefined) {
  if (!v || v.trim() === "") return null;
  const n = parseInt(v, 10); return isNaN(n) ? null : n;
}
function parseBigIntOrNull(v: string | undefined): bigint | null {
  if (!v || v.trim() === "") return null;
  try { return BigInt(v.trim()); } catch { return null; }
}

interface BmfRow {
  EIN: string; NAME: string; ICO: string; STREET: string; CITY: string;
  STATE: string; ZIP: string; GROUP: string; SUBSECTION: string;
  AFFILIATION: string; CLASSIFICATION: string; RULING: string;
  DEDUCTIBILITY: string; FOUNDATION: string; ACTIVITY: string;
  ORGANIZATION: string; STATUS: string; TAX_PERIOD: string;
  ASSET_CD: string; INCOME_CD: string; FILING_REQ_CD: string;
  PF_FILING_REQ_CD: string; ACCT_PD: string; ASSET_AMT: string;
  INCOME_AMT: string; REVENUE_AMT: string; NTEE_CD: string; SORT_NAME: string;
}

function mapRow(row: BmfRow): Prisma.IrsOrganizationCreateManyInput {
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

async function importFile(csvPath: string) {
  let batch: Prisma.IrsOrganizationCreateManyInput[] = [];
  let total = 0, skipped = 0;
  const parser = createReadStream(csvPath).pipe(
    parse({ columns: true, skip_empty_lines: true, trim: true, relax_column_count: true })
  );
  for await (const row of parser as AsyncIterable<BmfRow>) {
    if (!row.EIN || row.EIN.trim() === "") { skipped++; continue; }
    batch.push(mapRow(row));
    if (batch.length >= BATCH_SIZE) {
      await prisma.irsOrganization.createMany({ data: batch, skipDuplicates: true });
      total += batch.length;
      process.stdout.write(`\r  [${fileKey}] ${total.toLocaleString()} rows`);
      batch = [];
    }
  }
  if (batch.length > 0) {
    await prisma.irsOrganization.createMany({ data: batch, skipDuplicates: true });
    total += batch.length;
  }
  console.log(`\r  [${fileKey}] ${total.toLocaleString()} rows imported (${skipped} skipped)`);
  return total;
}

async function main() {
  const csvPath = path.join(DOWNLOAD_DIR, `${fileKey}.csv`);
  if (!fs.existsSync(csvPath)) {
    process.stdout.write(`  Downloading ${fileKey}.csv...`);
    await downloadFile(`${IRS_BASE_URL}/${fileKey}.csv`, csvPath);
    process.stdout.write(" done\n");
  }
  await importFile(csvPath);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(`\n  ERROR [${fileKey}]:`, e.message); prisma.$disconnect(); process.exit(1); });
