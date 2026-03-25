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
import unzipper from "unzipper";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BATCH_SIZE = 1000;
const DOWNLOAD_DIR = path.join(process.env.HOME || process.env.USERPROFILE || ".", ".webcrawler", "irs-filings");

// IRS SOI Annual Extract — ZIP files per year (Form 990, 990-EZ, 990-PF)
// URL pattern changed from "eofinextract" (≤2017) to "eoextract" (2018+)
// Source: https://www.irs.gov/statistics/soi-tax-stats-annual-extract-of-tax-exempt-organization-financial-data
const SOI_ZIPS = [
  // 2024 data (most recent)
  { url: "https://www.irs.gov/pub/irs-soi/24eoextract990.zip",   label: "2024 Form 990" },
  { url: "https://www.irs.gov/pub/irs-soi/24eoextract990EZ.zip", label: "2024 Form 990-EZ" },
  { url: "https://www.irs.gov/pub/irs-soi/24eoextract990pf.zip", label: "2024 Form 990-PF" },
  // 2023
  { url: "https://www.irs.gov/pub/irs-soi/23eoextract990.zip",   label: "2023 Form 990" },
  { url: "https://www.irs.gov/pub/irs-soi/23eoextractez.zip",    label: "2023 Form 990-EZ" },
  { url: "https://www.irs.gov/pub/irs-soi/23eoextract990pf.zip", label: "2023 Form 990-PF" },
  // 2022
  { url: "https://www.irs.gov/pub/irs-soi/22eoextract990.zip",   label: "2022 Form 990" },
  { url: "https://www.irs.gov/pub/irs-soi/22eoextractez.zip",    label: "2022 Form 990-EZ" },
  { url: "https://www.irs.gov/pub/irs-soi/22eoextract990pf.zip", label: "2022 Form 990-PF" },
  // 2021
  { url: "https://www.irs.gov/pub/irs-soi/21eoextract990.zip",   label: "2021 Form 990" },
  { url: "https://www.irs.gov/pub/irs-soi/21eoextractez.zip",    label: "2021 Form 990-EZ" },
  { url: "https://www.irs.gov/pub/irs-soi/21eoextract990pf.zip", label: "2021 Form 990-PF" },
  // 2020
  { url: "https://www.irs.gov/pub/irs-soi/20eoextract990.zip",   label: "2020 Form 990" },
  { url: "https://www.irs.gov/pub/irs-soi/20eoextractez.zip",    label: "2020 Form 990-EZ" },
  { url: "https://www.irs.gov/pub/irs-soi/20eoextract990pf.zip", label: "2020 Form 990-PF" },
  // 2019
  { url: "https://www.irs.gov/pub/irs-soi/19eoextract990.zip",   label: "2019 Form 990" },
  { url: "https://www.irs.gov/pub/irs-soi/19eoextractez.zip",    label: "2019 Form 990-EZ" },
  // 2018
  { url: "https://www.irs.gov/pub/irs-soi/18eoextract990.zip",   label: "2018 Form 990" },
  { url: "https://www.irs.gov/pub/irs-soi/18eoextractez.zip",    label: "2018 Form 990-EZ" },
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

// Extract all CSVs from a ZIP into DOWNLOAD_DIR, return list of extracted paths
async function extractZip(zipPath: string): Promise<string[]> {
  const extracted: string[] = [];
  const directory = await unzipper.Open.file(zipPath);
  for (const entry of directory.files) {
    if (entry.type === "File" && entry.path.toLowerCase().endsWith(".csv")) {
      const outPath = path.join(DOWNLOAD_DIR, path.basename(entry.path));
      await new Promise<void>((resolve, reject) => {
        entry.stream()
          .pipe(fs.createWriteStream(outPath))
          .on("finish", resolve)
          .on("error", reject);
      });
      extracted.push(outPath);
    }
  }
  return extracted;
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
  } else if (compensationOfficers !== null && totalExpenses !== null && totalExpenses > BigInt(0)) {
    pctOfficerCompensation = Number(compensationOfficers * BigInt(10000) / totalExpenses) / 10000;
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

// Loaded once at startup — used to filter rows without per-batch DB queries
let knownEins: Set<string> | null = null;

async function loadKnownEins(): Promise<Set<string>> {
  if (knownEins) return knownEins;
  process.stdout.write("  Loading known EINs from IrsOrganization...");
  // Stream in pages of 50k to avoid one huge result set
  const pageSize = 50_000;
  let cursor: string | undefined;
  const eins = new Set<string>();
  for (;;) {
    const rows = await prisma.irsOrganization.findMany({
      select: { ein: true },
      take: pageSize,
      ...(cursor ? { skip: 1, cursor: { ein: cursor } } : {}),
      orderBy: { ein: "asc" },
    });
    for (const r of rows) eins.add(r.ein);
    if (rows.length < pageSize) break;
    cursor = rows[rows.length - 1].ein;
  }
  console.log(` ${eins.size.toLocaleString()} orgs`);
  knownEins = eins;
  return eins;
}

async function upsertFilingBatch(rows: Prisma.IrsFilingCreateManyInput[]) {
  const eins = await loadKnownEins();
  const validRows = rows.filter(r => eins.has(r.ein));
  if (validRows.length === 0) return;

  try {
    await prisma.irsFiling.createMany({
      data: validRows,
      skipDuplicates: true,
    });
  } catch {
    // Row-by-row fallback for any conflict errors
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
  console.log("  IRS Filing Import — Nonprofit Financial Data (2018–2024)");
  console.log("═══════════════════════════════════════════════════════════");

  if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  let grandTotal = 0;
  const startTime = Date.now();
  // Track which CSVs we already imported (to avoid re-processing from "local files" pass)
  const importedCsvs = new Set<string>();

  for (const soi of SOI_ZIPS) {
    const zipName = path.basename(soi.url);
    const zipPath = path.join(DOWNLOAD_DIR, zipName);

    // Download ZIP if not cached
    if (!fs.existsSync(zipPath)) {
      process.stdout.write(`  Downloading ${soi.label}...`);
      const ok = await downloadFile(soi.url, zipPath);
      if (!ok || !fs.existsSync(zipPath) || fs.statSync(zipPath).size < 100) {
        console.log(` [skip] not available`);
        continue;
      }
      console.log(` done (${(fs.statSync(zipPath).size / 1024 / 1024).toFixed(1)} MB)`);
    }

    // Extract CSV(s) from ZIP
    let csvPaths: string[];
    try {
      csvPaths = await extractZip(zipPath);
    } catch (e: any) {
      console.log(`  [skip] ${soi.label}: ZIP extraction failed — ${e.message}`);
      continue;
    }

    if (csvPaths.length === 0) {
      console.log(`  [skip] ${soi.label}: no CSV found inside ZIP`);
      continue;
    }

    for (const csvPath of csvPaths) {
      if (importedCsvs.has(csvPath)) continue;
      importedCsvs.add(csvPath);
      grandTotal += await importFilingCsv(csvPath, soi.label);
    }
  }

  // Also import any CSVs already present locally (from previous runs or manual downloads)
  const localFiles = fs.readdirSync(DOWNLOAD_DIR).filter(f =>
    f.endsWith(".csv") && !importedCsvs.has(path.join(DOWNLOAD_DIR, f))
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
