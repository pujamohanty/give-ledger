/**
 * IRS Filing Import — Downloads and imports nonprofit financial data from
 * the IRS SOI Annual Extract of Tax-Exempt Organization Financial Data.
 *
 * Run with: npm run import:irs-filings
 *
 * Data source: https://www.irs.gov/statistics/soi-tax-stats-annual-extract-of-tax-exempt-organization-financial-data
 *
 * This imports the bulk CSV files that contain revenue, expenses, assets,
 * liabilities, and compensation data for each filing year.
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
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BATCH_SIZE = 1000;
const DOWNLOAD_DIR = path.join(process.env.HOME || process.env.USERPROFILE || ".", ".webcrawler", "irs-filings");

// SOI data files — the IRS publishes separate CSVs for each form type
// These URLs may change when IRS updates their data
const SOI_FILES = [
  { url: "https://www.irs.gov/pub/irs-soi/soi-extract-990.csv", label: "Form 990", formType: "990" },
  { url: "https://www.irs.gov/pub/irs-soi/soi-extract-990ez.csv", label: "Form 990-EZ", formType: "990EZ" },
  { url: "https://www.irs.gov/pub/irs-soi/soi-extract-990pf.csv", label: "Form 990-PF", formType: "990PF" },
];

// Also try the annual extract pattern (IRS changes URLs periodically)
const SOI_ALT_URLS = [
  "https://www.irs.gov/pub/irs-soi/19eofinextract990.csv",
  "https://www.irs.gov/pub/irs-soi/20eofinextract990.csv",
  "https://www.irs.gov/pub/irs-soi/21eofinextract990.csv",
  "https://www.irs.gov/pub/irs-soi/22eofinextract990.csv",
  "https://www.irs.gov/pub/irs-soi/23eofinextract990.csv",
];

// ─── Download helpers ────────────────────────────────────────────────────────

function downloadFile(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const file = fs.createWriteStream(dest);
    const client = url.startsWith("https") ? https : http;

    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        downloadFile(res.headers.location!, dest).then(resolve);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        resolve(false);
        return;
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(true); });
    }).on("error", () => {
      file.close();
      fs.unlink(dest, () => {});
      resolve(false);
    });
  });
}

// ─── Parsing helpers ─────────────────────────────────────────────────────────

function parseBigIntOrNull(val: string | undefined): bigint | null {
  if (!val || val.trim() === "") return null;
  try {
    // Remove commas and handle negative numbers
    const clean = val.replace(/,/g, "").trim();
    return BigInt(Math.round(parseFloat(clean)));
  } catch { return null; }
}

function parseIntOrNull(val: string | undefined): number | null {
  if (!val || val.trim() === "") return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function parseFloatOrNull(val: string | undefined): number | null {
  if (!val || val.trim() === "") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

// ─── Field mapping ───────────────────────────────────────────────────────────
// The SOI CSV columns use the IRS "element names" which vary by form type.
// We normalize to our schema's field names.

function mapFilingRow(row: Record<string, string>): Prisma.IrsFilingCreateManyInput | null {
  const ein = (row.ein || row.EIN || "").replace(/-/g, "").padStart(9, "0");
  if (!ein || ein === "000000000") return null;

  const taxPeriod = row.tax_prd || row.TAX_PRD || row.tax_pd || "";
  const taxYear = parseInt(taxPeriod.substring(0, 4), 10);
  if (isNaN(taxYear) || taxYear < 2000) return null;

  const formType = row.formtype || row.FORMTYPE || row.rtrn_tp || "";
  let returnType = "990";
  if (formType === "1" || formType.includes("EZ")) returnType = "990EZ";
  if (formType === "2" || formType.includes("PF")) returnType = "990PF";

  // Revenue — try multiple possible column names
  const totalRevenue = parseBigIntOrNull(
    row.totrevenue || row.totrevnue || row.totrcptperbks ||
    row.cy_tot_rev || row.CYTotalRevenueAmt || row.totrev
  );

  // Expenses
  const totalExpenses = parseBigIntOrNull(
    row.totfuncexpns || row.totexpns || row.totexpnsperbks ||
    row.cy_tot_exp || row.CYTotalExpensesAmt || row.totexp
  );

  // Assets
  const totalAssetsEOY = parseBigIntOrNull(
    row.totassetsend || row.totassetse || row.eoy_tot_ast ||
    row.TotalAssetsEOYAmt || row.totast_eoy
  );
  const totalAssetsBOY = parseBigIntOrNull(
    row.totassetsbeg || row.totassetsb || row.boy_tot_ast ||
    row.TotalAssetsBOYAmt || row.totast_boy
  );

  // Liabilities
  const totalLiabilitiesEOY = parseBigIntOrNull(
    row.totliabend || row.totliabe || row.eoy_tot_lia ||
    row.TotalLiabilitiesEOYAmt || row.totlia_eoy
  );
  const totalLiabilitiesBOY = parseBigIntOrNull(
    row.totliabbe || row.totliabb || row.boy_tot_lia || row.totlia_boy
  );

  // Net assets
  const netAssetsEOY = parseBigIntOrNull(
    row.totnetassetend || row.tnae || row.eoy_net_ast || row.netast_eoy
  );

  // Revenue breakdown
  const contributionsAndGrants = parseBigIntOrNull(
    row.grscontman || row.contrigifts || row.cy_contri ||
    row.CYContributionsGrantsAmt || row.contrbtns
  );
  const programServiceRevenue = parseBigIntOrNull(
    row.grsprfrev || row.svcrev || row.cy_prog_svc ||
    row.CYProgramServiceRevenueAmt || row.progrev
  );
  const investmentIncome = parseBigIntOrNull(
    row.invstmntinc || row.invstinc || row.cy_inv_inc ||
    row.CYInvestmentIncomeAmt || row.invinc
  );

  // Compensation
  const compensationOfficers = parseBigIntOrNull(
    row.compnsatncurrofcr || row.compofficers || row.comp_off ||
    row.CompensationOfCurrentOfficersAmt || row.offcomp
  );
  const salariesAndWages = parseBigIntOrNull(
    row.othrsalwages || row.salaries || row.sal_wages ||
    row.SalariesAndWagesAmt || row.salwages
  );

  // Officer compensation as % of expenses
  let pctOfficerCompensation: number | null = null;
  const pctRaw = parseFloatOrNull(
    row.pct_compnsatncurrofcr || row.pctcompoff
  );
  if (pctRaw !== null) {
    pctOfficerCompensation = pctRaw;
  } else if (compensationOfficers !== null && totalExpenses !== null && totalExpenses > 0n) {
    pctOfficerCompensation = Number(compensationOfficers * 10000n / totalExpenses) / 10000;
  }

  // Staffing
  const employeeCount = parseIntOrNull(row.noofemployees || row.employees || row.emp_cnt);
  const volunteerCount = parseIntOrNull(row.noofvolunteers || row.volunteers || row.vol_cnt);

  return {
    ein,
    taxYear,
    returnType,
    totalRevenue,
    totalExpenses,
    totalAssetsEOY,
    totalAssetsBOY,
    totalLiabilitiesEOY,
    totalLiabilitiesBOY,
    netAssetsEOY,
    contributionsAndGrants,
    programServiceRevenue,
    investmentIncome,
    compensationOfficers,
    salariesAndWages,
    pctOfficerCompensation,
    employeeCount,
    volunteerCount,
    objectId: row.object_id || row.OBJECT_ID || null,
    filingType: row.filing_type || row.FILING_TYPE || null,
  };
}

// ─── Import logic ────────────────────────────────────────────────────────────

async function importFilingCsv(filePath: string, label: string): Promise<number> {
  let batch: Prisma.IrsFilingCreateManyInput[] = [];
  let total = 0;
  let skipped = 0;

  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      relax_quotes: true,
    })
  );

  for await (const row of parser as AsyncIterable<Record<string, string>>) {
    const mapped = mapFilingRow(row);
    if (!mapped) {
      skipped++;
      continue;
    }

    batch.push(mapped);

    if (batch.length >= BATCH_SIZE) {
      await upsertFilingBatch(batch);
      total += batch.length;
      process.stdout.write(`\r  [${label}] ${total.toLocaleString()} filings imported`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await upsertFilingBatch(batch);
    total += batch.length;
  }

  console.log(`\r  [${label}] ${total.toLocaleString()} filings imported (${skipped} skipped)`);
  return total;
}

async function upsertFilingBatch(rows: Prisma.IrsFilingCreateManyInput[]) {
  // Filter to only EINs that exist in IrsOrganization
  // (filing without an org record would violate the FK constraint)
  const eins = [...new Set(rows.map(r => r.ein))];
  const existingOrgs = await prisma.irsOrganization.findMany({
    where: { ein: { in: eins } },
    select: { ein: true },
  });
  const existingEins = new Set(existingOrgs.map(o => o.ein));
  const validRows = rows.filter(r => existingEins.has(r.ein));

  if (validRows.length === 0) return;

  try {
    await prisma.irsFiling.createMany({
      data: validRows,
      skipDuplicates: true,
    });
  } catch (e: any) {
    // Row-by-row fallback for conflicts
    for (const row of validRows) {
      try {
        await prisma.irsFiling.upsert({
          where: { ein_taxYear: { ein: row.ein, taxYear: row.taxYear } },
          create: row,
          update: {
            totalRevenue: row.totalRevenue,
            totalExpenses: row.totalExpenses,
            totalAssetsEOY: row.totalAssetsEOY,
            totalLiabilitiesEOY: row.totalLiabilitiesEOY,
            compensationOfficers: row.compensationOfficers,
            pctOfficerCompensation: row.pctOfficerCompensation,
            employeeCount: row.employeeCount,
            volunteerCount: row.volunteerCount,
          },
        });
      } catch {}
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  IRS Filing Import — Nonprofit Financial Data");
  console.log("═══════════════════════════════════════════════════════════");

  if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  let grandTotal = 0;
  const startTime = Date.now();

  // Try main SOI files first
  for (const soi of SOI_FILES) {
    const csvPath = path.join(DOWNLOAD_DIR, path.basename(soi.url));

    if (!fs.existsSync(csvPath)) {
      console.log(`  Downloading ${soi.label}...`);
      const ok = await downloadFile(soi.url, csvPath);
      if (!ok) {
        console.log(`  [skip] ${soi.label}: not available at expected URL`);
        continue;
      }
    }

    if (fs.existsSync(csvPath) && fs.statSync(csvPath).size > 100) {
      grandTotal += await importFilingCsv(csvPath, soi.label);
    }
  }

  // Try annual extract files
  for (const altUrl of SOI_ALT_URLS) {
    const csvPath = path.join(DOWNLOAD_DIR, path.basename(altUrl));

    if (!fs.existsSync(csvPath)) {
      console.log(`  Downloading ${path.basename(altUrl)}...`);
      const ok = await downloadFile(altUrl, csvPath);
      if (!ok) {
        console.log(`  [skip] ${path.basename(altUrl)}: not available`);
        continue;
      }
    }

    if (fs.existsSync(csvPath) && fs.statSync(csvPath).size > 100) {
      const label = path.basename(altUrl, ".csv");
      grandTotal += await importFilingCsv(csvPath, label);
    }
  }

  // Also check for any locally downloaded SOI files
  const localFiles = fs.readdirSync(DOWNLOAD_DIR).filter(f =>
    f.endsWith(".csv") && !SOI_FILES.some(s => path.basename(s.url) === f) &&
    !SOI_ALT_URLS.some(u => path.basename(u) === f)
  );
  for (const localFile of localFiles) {
    const csvPath = path.join(DOWNLOAD_DIR, localFile);
    if (fs.statSync(csvPath).size > 100) {
      grandTotal += await importFilingCsv(csvPath, localFile);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`  Done! ${grandTotal.toLocaleString()} filings imported in ${elapsed} min`);
  console.log("═══════════════════════════════════════════════════════════");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
