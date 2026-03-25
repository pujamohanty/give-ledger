/**
 * IO-efficient IRS BMF import using PostgreSQL COPY protocol.
 *
 * For each state CSV file:
 *   1. Create a TEMP TABLE with text columns (no indexes, no constraints)
 *   2. COPY the CSV file directly into the temp table — single streaming write, minimal IO
 *   3. INSERT INTO IrsOrganization SELECT ... FROM temp_table ON CONFLICT DO NOTHING
 *   4. Temp table is dropped automatically when the session ends
 *
 * This is ~10–20x more IO-efficient than batched Prisma createMany because:
 *   - COPY writes pages sequentially (no per-row index writes during load)
 *   - INSERT ... SELECT is a single set operation Postgres can pipeline
 *   - No repeated round-trips (was 300+ per chunk; now 2 statements per file)
 *
 * Usage: npx tsx prisma/import-irs-copy.ts <csvPath> [label]
 */

import "dotenv/config";
import { Client } from "pg";
import { createReadStream } from "fs";
import { from as copyFrom } from "pg-copy-streams";
import { pipeline } from "stream/promises";

const CSV_PATH = process.argv[2];
const LABEL    = process.argv[3] || CSV_PATH;

if (!CSV_PATH) {
  console.error("Usage: npx tsx prisma/import-irs-copy.ts <csvPath> [label]");
  process.exit(1);
}

const CONNECTION_STRING = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!CONNECTION_STRING) {
  console.error("No DATABASE_URL or DIRECT_URL set");
  process.exit(1);
}

async function main() {
  const client = new Client({
    connectionString: CONNECTION_STRING,
    connectionTimeoutMillis: 30000,
    query_timeout: 0, // no timeout on queries
  });

  await client.connect();

  try {
    // No statement timeout — bulk operations can take minutes on large states
    await client.query("SET statement_timeout = 0");

    // ── Step 1: Temp table (all text, no indexes) ────────────────────────
    await client.query(`
      CREATE TEMP TABLE irs_import_temp (
        "EIN"            text,
        "NAME"           text,
        "ICO"            text,
        "STREET"         text,
        "CITY"           text,
        "STATE"          text,
        "ZIP"            text,
        "GROUP"          text,
        "SUBSECTION"     text,
        "AFFILIATION"    text,
        "CLASSIFICATION" text,
        "RULING"         text,
        "DEDUCTIBILITY"  text,
        "FOUNDATION"     text,
        "ACTIVITY"       text,
        "ORGANIZATION"   text,
        "STATUS"         text,
        "TAX_PERIOD"     text,
        "ASSET_CD"       text,
        "INCOME_CD"      text,
        "FILING_REQ_CD"  text,
        "PF_FILING_REQ_CD" text,
        "ACCT_PD"        text,
        "ASSET_AMT"      text,
        "INCOME_AMT"     text,
        "REVENUE_AMT"    text,
        "NTEE_CD"        text,
        "SORT_NAME"      text
      )
    `);

    // ── Step 2: Stream CSV → temp table via COPY ─────────────────────────
    process.stdout.write(`  [${LABEL}] Streaming CSV...`);
    const t0 = Date.now();

    const copyStream = client.query(
      copyFrom(
        `COPY irs_import_temp (
          "EIN","NAME","ICO","STREET","CITY","STATE","ZIP","GROUP",
          "SUBSECTION","AFFILIATION","CLASSIFICATION","RULING","DEDUCTIBILITY",
          "FOUNDATION","ACTIVITY","ORGANIZATION","STATUS","TAX_PERIOD",
          "ASSET_CD","INCOME_CD","FILING_REQ_CD","PF_FILING_REQ_CD","ACCT_PD",
          "ASSET_AMT","INCOME_AMT","REVENUE_AMT","NTEE_CD","SORT_NAME"
        ) FROM STDIN WITH (FORMAT csv, HEADER true)`
      )
    );

    await pipeline(createReadStream(CSV_PATH), copyStream);
    const copyMs = Date.now() - t0;
    process.stdout.write(` done (${(copyMs / 1000).toFixed(1)}s)\n`);

    // ── Step 3: INSERT SELECT with type casting ──────────────────────────
    process.stdout.write(`  [${LABEL}] Inserting...`);
    const t1 = Date.now();

    const result = await client.query(`
      INSERT INTO "IrsOrganization" (
        id, ein, name, "sortName", ico, street, city, state, zip,
        subsection, affiliation, classification, ruling, deductibility,
        foundation, activity, organization, "exemptStatus", "taxPeriod",
        "assetCode", "incomeCode", "filingReqCode", "pfFilingReqCode",
        "accountingPeriod", "assetAmount", "incomeAmount", "revenueAmount",
        "nteeCode", "groupNumber", "bmfLastUpdated", "createdAt", "updatedAt"
      )
      SELECT
        gen_random_uuid()::text,
        LPAD(REPLACE(TRIM("EIN"), '-', ''), 9, '0'),
        COALESCE(NULLIF(TRIM("NAME"), ''), 'UNKNOWN'),
        NULLIF(TRIM("SORT_NAME"), ''),
        NULLIF(TRIM("ICO"), ''),
        NULLIF(TRIM("STREET"), ''),
        NULLIF(TRIM("CITY"), ''),
        NULLIF(TRIM("STATE"), ''),
        NULLIF(TRIM("ZIP"), ''),
        CASE WHEN TRIM("SUBSECTION")     ~ '^[0-9]+$' THEN TRIM("SUBSECTION")::int     ELSE NULL END,
        CASE WHEN TRIM("AFFILIATION")    ~ '^[0-9]+$' THEN TRIM("AFFILIATION")::int    ELSE NULL END,
        CASE WHEN TRIM("CLASSIFICATION") ~ '^[0-9]+$' THEN TRIM("CLASSIFICATION")::int ELSE NULL END,
        NULLIF(TRIM("RULING"), ''),
        CASE WHEN TRIM("DEDUCTIBILITY")  ~ '^[0-9]+$' THEN TRIM("DEDUCTIBILITY")::int  ELSE NULL END,
        CASE WHEN TRIM("FOUNDATION")     ~ '^[0-9]+$' THEN TRIM("FOUNDATION")::int     ELSE NULL END,
        NULLIF(TRIM("ACTIVITY"), ''),
        CASE WHEN TRIM("ORGANIZATION")   ~ '^[0-9]+$' THEN TRIM("ORGANIZATION")::int   ELSE NULL END,
        CASE WHEN TRIM("STATUS")         ~ '^[0-9]+$' THEN TRIM("STATUS")::int         ELSE NULL END,
        NULLIF(TRIM("TAX_PERIOD"), ''),
        CASE WHEN TRIM("ASSET_CD")       ~ '^[0-9]+$' THEN TRIM("ASSET_CD")::int       ELSE NULL END,
        CASE WHEN TRIM("INCOME_CD")      ~ '^[0-9]+$' THEN TRIM("INCOME_CD")::int      ELSE NULL END,
        CASE WHEN TRIM("FILING_REQ_CD")  ~ '^[0-9]+$' THEN TRIM("FILING_REQ_CD")::int  ELSE NULL END,
        CASE WHEN TRIM("PF_FILING_REQ_CD") ~ '^[0-9]+$' THEN TRIM("PF_FILING_REQ_CD")::int ELSE NULL END,
        CASE WHEN TRIM("ACCT_PD")        ~ '^[0-9]+$' THEN TRIM("ACCT_PD")::int        ELSE NULL END,
        CASE WHEN TRIM("ASSET_AMT")      ~ '^[0-9]+$' THEN TRIM("ASSET_AMT")::bigint   ELSE NULL END,
        CASE WHEN TRIM("INCOME_AMT")     ~ '^[0-9]+$' THEN TRIM("INCOME_AMT")::bigint  ELSE NULL END,
        CASE WHEN TRIM("REVENUE_AMT")    ~ '^[0-9]+$' THEN TRIM("REVENUE_AMT")::bigint ELSE NULL END,
        NULLIF(TRIM("NTEE_CD"), ''),
        NULLIF(TRIM("GROUP"), ''),
        NOW(),
        NOW(),
        NOW()
      FROM irs_import_temp
      WHERE TRIM("EIN") <> ''
      ON CONFLICT (ein) DO NOTHING
    `);

    const insertMs = Date.now() - t1;
    const inserted = result.rowCount ?? 0;
    console.log(` ${inserted.toLocaleString()} rows inserted (${(insertMs / 1000).toFixed(1)}s)`);
    console.log(`  [${LABEL}] total time: ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  } finally {
    await client.end();
  }
}

main().catch(e => {
  console.error(`\n  ERROR [${LABEL}]:`, e.message);
  process.exit(1);
});
