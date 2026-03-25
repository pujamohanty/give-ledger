/**
 * Imports a single CSV file (by path) into IrsOrganization.
 * Used by import-irs-chunk.sh to import pre-split chunk files.
 *
 * Usage: npx tsx prisma/import-irs-single-path.ts <csvPath> <label>
 */

import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { parse } from "csv-parse";
import { createReadStream } from "fs";

// Use direct connection (port 5432) — bypasses pgbouncer, no statement_timeout.
// max:3 gives Prisma enough connections without saturating Supabase free-tier limit.
const CONNECTION_STRING = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!CONNECTION_STRING) { console.error("DATABASE_URL is required"); process.exit(1); }

const pool = new Pool({
  connectionString: CONNECTION_STRING,
  max: 3,
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 300000,  // keep idle connections alive for 5 min
  keepAlive: true,
});

// Disable statement_timeout for every connection in this pool.
// Supabase free tier has a ~30s default; bulk inserts into a 1.7M row table
// with multiple indexes can exceed that. Safe for a batch-import process.
pool.on("connect", (client) => {
  client.query("SET statement_timeout = 0").catch(() => {});
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const csvPath = process.argv[2];
const label = process.argv[3] || csvPath;
if (!csvPath) { console.error("Usage: npx tsx prisma/import-irs-single-path.ts <csvPath> <label>"); process.exit(1); }

const BATCH_SIZE = 50;

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

async function insertBatch(batch: Prisma.IrsOrganizationCreateManyInput[], retries = 3): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.irsOrganization.createMany({ data: batch, skipDuplicates: true });
      return;
    } catch (e: any) {
      const isRetryable = e.message?.includes("connection") || e.message?.includes("timeout") || e.message?.includes("ECONNRESET");
      if (attempt < retries && isRetryable) {
        await new Promise(r => setTimeout(r, 2000 * attempt)); // 2s, 4s backoff
        continue;
      }
      throw e;
    }
  }
}

async function main() {
  let batch: Prisma.IrsOrganizationCreateManyInput[] = [];
  let total = 0, skipped = 0;

  const parser = createReadStream(csvPath).pipe(
    parse({ columns: true, skip_empty_lines: true, trim: true, relax_column_count: true })
  );

  for await (const row of parser as AsyncIterable<BmfRow>) {
    if (!row.EIN || row.EIN.trim() === "") { skipped++; continue; }
    batch.push(mapRow(row));
    if (batch.length >= BATCH_SIZE) {
      await insertBatch(batch);
      total += batch.length;
      process.stdout.write(`\r  [${label}] ${total.toLocaleString()} rows`);
      batch = [];
    }
  }
  if (batch.length > 0) {
    await insertBatch(batch);
    total += batch.length;
  }

  console.log(`\r  [${label}] ${total.toLocaleString()} rows imported (${skipped} skipped)`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(`\n  ERROR [${label}]:`, e.message);
  prisma.$disconnect();
  process.exit(1);
});
