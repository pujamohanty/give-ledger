/**
 * OpenCorporates Monthly Sync
 * Pulls newly incorporated companies from OpenCorporates API
 * and enriches or creates records in the Company table.
 *
 * Usage:
 *   npm run sync:oc-companies
 *   npm run sync:oc-companies -- --from=2026-03-01   (incremental)
 *
 * Requires: OC_API_KEY in .env (optional — free tier is 5000 calls/day without key)
 * Free tier: 5,000 API calls/day (unauthenticated)
 * With API key: higher limits available — register at https://opencorporates.com/api_accounts/new
 *
 * This script:
 * 1. Searches for new companies incorporated in the last 30 days (or --from date)
 * 2. Filters by US jurisdictions (all 50 states + DC)
 * 3. Upserts into Company table — enriching SAM.gov records or creating new ones
 *
 * Rate limiting: ~1 request/second to stay within free tier limits
 */

import { config } from "dotenv";
import path from "path";
import { PrismaClient } from "../src/generated/prisma";
import pg from "pg";

config({ path: path.join(__dirname, "../.env") });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
  adapter: new (require("@prisma/adapter-pg").PrismaPg)(pool),
});

const OC_API_KEY = process.env.OC_API_KEY; // optional
const OC_BASE = "https://api.opencorporates.com/v0.4";

// US state jurisdiction codes for OpenCorporates
const US_JURISDICTIONS = [
  "us_al","us_ak","us_az","us_ar","us_ca","us_co","us_ct","us_de","us_fl","us_ga",
  "us_hi","us_id","us_il","us_in","us_ia","us_ks","us_ky","us_la","us_me","us_md",
  "us_ma","us_mi","us_mn","us_ms","us_mo","us_mt","us_ne","us_nv","us_nh","us_nj",
  "us_nm","us_ny","us_nc","us_nd","us_oh","us_ok","us_or","us_pa","us_ri","us_sc",
  "us_sd","us_tn","us_tx","us_ut","us_vt","us_va","us_wa","us_wv","us_wi","us_wy",
  "us_dc",
];

// State code to 2-letter abbreviation
function jurisdictionToState(jurisdiction: string): string {
  return jurisdiction.replace("us_", "").toUpperCase();
}

interface OcCompany {
  name?: string;
  company_number?: string;
  jurisdiction_code?: string;
  incorporation_date?: string;
  company_type?: string;
  current_status?: string;
  registered_address?: {
    street_address?: string;
    locality?: string;
    region?: string;
    postal_code?: string;
  };
  registered_address_in_full?: string;
  registered_agents?: unknown[];
  source?: { publisher?: string; url?: string };
}

interface OcSearchResult {
  results?: {
    companies?: { company?: OcCompany }[];
    total_count?: number;
    page?: number;
    per_page?: number;
  };
}

async function fetchOcPage(
  jurisdiction: string,
  fromDate: string,
  toDate: string,
  page: number
): Promise<{ companies: OcCompany[]; total: number }> {
  const params = new URLSearchParams({
    jurisdiction_code: jurisdiction,
    "incorporation_date[from]": fromDate,
    "incorporation_date[to]": toDate,
    current_status: "Active",
    per_page: "100",
    page: String(page),
  });

  if (OC_API_KEY) {
    params.set("api_token", OC_API_KEY);
  }

  const url = `${OC_BASE}/companies/search?${params.toString()}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (res.status === 429) {
      console.log("    Rate limited — waiting 5 seconds...");
      await new Promise((r) => setTimeout(r, 5000));
      return fetchOcPage(jurisdiction, fromDate, toDate, page);
    }

    if (!res.ok) return { companies: [], total: 0 };

    const data = await res.json() as OcSearchResult;
    const results = data.results ?? {};
    const companies = (results.companies ?? [])
      .map((c) => c.company)
      .filter(Boolean) as OcCompany[];

    return { companies, total: results.total_count ?? 0 };
  } catch {
    return { companies: [], total: 0 };
  }
}

function extractCompanyType(ocType?: string): string[] {
  if (!ocType) return [];
  const lower = ocType.toLowerCase();
  if (lower.includes("llc") || lower.includes("limited liability")) return ["Limited Liability Company"];
  if (lower.includes("corp")) return ["Corporation"];
  if (lower.includes("partnership")) return ["Partnership"];
  if (lower.includes("sole")) return ["Sole Proprietor"];
  return [ocType];
}

async function syncJurisdiction(
  jurisdiction: string,
  fromDate: string,
  toDate: string
): Promise<number> {
  const first = await fetchOcPage(jurisdiction, fromDate, toDate, 1);
  if (first.total === 0) return 0;

  const state = jurisdictionToState(jurisdiction);
  const pages = Math.min(Math.ceil(first.total / 100), 5); // max 5 pages per jurisdiction per run
  let saved = 0;

  const processPage = async (companies: OcCompany[]) => {
    for (const co of companies) {
      if (!co.name || !co.company_number) continue;

      const addr = co.registered_address ?? {};
      const businessTypes = extractCompanyType(co.company_type);

      // Try to find existing company by name + state first (may already be from SAM.gov)
      const existing = await prisma.company.findFirst({
        where: {
          legalName: { equals: co.name, mode: "insensitive" },
          state,
        },
        select: { id: true },
      });

      if (existing) {
        // Enrich existing SAM.gov record with OC data
        await prisma.company.update({
          where: { id: existing.id },
          data: {
            ocCompanyNumber: co.company_number,
            ocJurisdiction: jurisdiction,
            incorporationDate: co.incorporation_date ? new Date(co.incorporation_date) : undefined,
            ocRegistered: true,
          },
        });
      } else {
        // New company — create from OC data alone
        await prisma.company.create({
          data: {
            legalName: co.name,
            ocCompanyNumber: co.company_number,
            ocJurisdiction: jurisdiction,
            incorporationDate: co.incorporation_date ? new Date(co.incorporation_date) : null,
            streetAddress: addr.street_address ?? null,
            city: addr.locality ?? null,
            state,
            zipCode: addr.postal_code ?? null,
            businessTypes,
            naicsCodes: [],
            sbaDesignations: [],
            ocRegistered: true,
            samRegistered: false,
            isActive: true,
          },
        });
      }
      saved++;
    }
  };

  await processPage(first.companies);

  for (let p = 2; p <= pages; p++) {
    await new Promise((r) => setTimeout(r, 1000)); // 1 req/sec
    const page = await fetchOcPage(jurisdiction, fromDate, toDate, p);
    await processPage(page.companies);
  }

  return saved;
}

async function main() {
  const fromArg = process.argv.find((a) => a.startsWith("--from="));
  const toArg = process.argv.find((a) => a.startsWith("--to="));

  const toDate = toArg
    ? toArg.replace("--to=", "")
    : new Date().toISOString().slice(0, 10);

  const fromDate = fromArg
    ? fromArg.replace("--from=", "")
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().slice(0, 10);
      })();

  console.log(`OpenCorporates sync: ${fromDate} → ${toDate}`);
  console.log(`Scanning ${US_JURISDICTIONS.length} US jurisdictions...\n`);

  let total = 0;
  for (const jurisdiction of US_JURISDICTIONS) {
    const state = jurisdictionToState(jurisdiction);
    process.stdout.write(`  ${state}... `);
    try {
      const count = await syncJurisdiction(jurisdiction, fromDate, toDate);
      console.log(`${count} saved`);
      total += count;
    } catch (err) {
      console.log(`error — skipping`);
    }
    await new Promise((r) => setTimeout(r, 200)); // small delay between jurisdictions
  }

  const dbTotal = await prisma.company.count({ where: { ocRegistered: true } });
  console.log(`\nDone. Companies enriched/created from OpenCorporates: ${total.toLocaleString()}`);
  console.log(`Total OC-registered companies in DB: ${dbTotal.toLocaleString()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
