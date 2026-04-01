/**
 * SAM.gov Company Importer
 * Pulls entity registrations from SAM.gov's free Entity Management API
 * and stores them in the Company table.
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json prisma/import-sam-companies.ts
 *   or: npm run import:sam-companies
 *
 * Requires: SAM_GOV_API_KEY in .env
 *
 * The script queries by NAICS code prefix to pull companies matching
 * the 12 Career Compass sectors. Saves to Company table.
 * Safe to re-run — uses upsert on uei (Unique Entity Identifier).
 *
 * Monthly update: re-run to pull new registrations. The SAM.gov API
 * supports filtering by registrationDate=[FROM],[TO] for incremental pulls.
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

const SAM_API_KEY = process.env.SAM_GOV_API_KEY;
const SAM_BASE = "https://api.sam.gov/entity-information/v3/entities";

// NAICS code prefixes mapped to Career Compass sectors
const SECTOR_NAICS: { sector: string; naicsPrefix: string; description: string }[] = [
  { sector: "technology-software",      naicsPrefix: "5415",  description: "Computer Systems Design" },
  { sector: "technology-software",      naicsPrefix: "5112",  description: "Software Publishers" },
  { sector: "technology-software",      naicsPrefix: "5182",  description: "Data Processing & Hosting" },
  { sector: "marketing-advertising",    naicsPrefix: "5418",  description: "Advertising, PR & Related" },
  { sector: "financial-services",       naicsPrefix: "5221",  description: "Commercial Banking" },
  { sector: "financial-services",       naicsPrefix: "5231",  description: "Securities & Investments" },
  { sector: "financial-services",       naicsPrefix: "5241",  description: "Insurance Carriers" },
  { sector: "healthcare",               naicsPrefix: "6211",  description: "Offices of Physicians" },
  { sector: "healthcare",               naicsPrefix: "6212",  description: "Offices of Dentists" },
  { sector: "healthcare",               naicsPrefix: "6216",  description: "Home Health Care Services" },
  { sector: "legal-services",           naicsPrefix: "5411",  description: "Legal Services" },
  { sector: "education",                naicsPrefix: "6113",  description: "Colleges & Universities" },
  { sector: "education",                naicsPrefix: "6114",  description: "Business Schools & Training" },
  { sector: "real-estate",              naicsPrefix: "5312",  description: "Offices of Real Estate Agents" },
  { sector: "real-estate",              naicsPrefix: "5313",  description: "Real Estate Property Managers" },
  { sector: "hr-staffing",              naicsPrefix: "5613",  description: "Employment Services" },
  { sector: "logistics-supply-chain",   naicsPrefix: "4841",  description: "General Freight Trucking" },
  { sector: "logistics-supply-chain",   naicsPrefix: "4922",  description: "Couriers & Express Delivery" },
  { sector: "media-entertainment",      naicsPrefix: "5151",  description: "Radio & TV Broadcasting" },
  { sector: "media-entertainment",      naicsPrefix: "5191",  description: "Other Information Services" },
  { sector: "ecommerce-retail",         naicsPrefix: "5411",  description: "Electronic Shopping" },
  { sector: "professional-services",    naicsPrefix: "5416",  description: "Management Consulting" },
  { sector: "professional-services",    naicsPrefix: "5412",  description: "Accounting & Tax" },
];

interface SamEntity {
  entityRegistration?: {
    ueiSAM?: string;
    cageCode?: string;
    legalBusinessName?: string;
    dbaName?: string;
    registrationDate?: string;
    entityEFTIndicator?: string;
    registrationExpirationDate?: string;
  };
  coreData?: {
    physicalAddress?: {
      addressLine1?: string;
      city?: string;
      stateOrProvinceCode?: string;
      zipCode?: string;
    };
    entityInformation?: {
      entityURL?: string;
      entityStructureDesc?: string;
    };
    businessTypes?: {
      businessTypeList?: { businessTypeDesc?: string }[];
      sbaBusinessTypeList?: { sbaBusinessTypeDesc?: string }[];
    };
    generalInformation?: {
      entityStructureCode?: string;
      entityStructureDesc?: string;
      entityTypeCode?: string;
      entityTypeDesc?: string;
      organizationStructureCode?: string;
      organizationStructureDesc?: string;
      stateOfIncorporationCode?: string;
      stateOfIncorporationDesc?: string;
    };
    financialInformation?: {
      taxpayerIdentificationNumber?: string;
    };
  };
  assertions?: {
    goodsAndServices?: {
      primaryNaics?: string;
      naicsCodeList?: { naicsCode?: string; naicsDescription?: string }[];
    };
    sizeMetrics?: {
      employeesTotal?: number;
    };
  };
  pointsOfContact?: {
    electronicBusinessPOC?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
}

function extractCompanyData(entity: SamEntity, naicsPrefix: string) {
  const reg = entity.entityRegistration ?? {};
  const core = entity.coreData ?? {};
  const addr = core.physicalAddress ?? {};
  const bizTypes = core.businessTypes ?? {};
  const info = core.entityInformation ?? {};
  const general = core.generalInformation ?? {};
  const gns = entity.assertions?.goodsAndServices ?? {};
  const poc = entity.pointsOfContact?.electronicBusinessPOC;

  const uei = reg.ueiSAM;
  const legalName = reg.legalBusinessName;
  if (!uei || !legalName) return null;

  // Check registration is not expired
  if (reg.registrationExpirationDate) {
    const expiry = new Date(reg.registrationExpirationDate);
    if (expiry < new Date()) return null; // skip expired registrations
  }

  const naicsCodes = (gns.naicsCodeList ?? [])
    .map((n) => n.naicsCode)
    .filter(Boolean) as string[];

  const naicsPrimary = gns.primaryNaics ?? naicsPrefix;
  const naicsDescription = gns.naicsCodeList?.find(
    (n) => n.naicsCode === naicsPrimary
  )?.naicsDescription ?? info.entityStructureDesc ?? null;

  const businessTypes = (bizTypes.businessTypeList ?? [])
    .map((b) => b.businessTypeDesc)
    .filter(Boolean) as string[];

  const sbaDesignations = (bizTypes.sbaBusinessTypeList ?? [])
    .map((b) => b.sbaBusinessTypeDesc)
    .filter(Boolean) as string[];

  return {
    uei,
    legalName,
    dbaName: reg.dbaName ?? null,
    ein: core.financialInformation?.taxpayerIdentificationNumber ?? null,
    cageCode: reg.cageCode ?? null,
    streetAddress: addr.addressLine1 ?? null,
    city: addr.city ?? null,
    state: addr.stateOrProvinceCode ?? null,
    zipCode: addr.zipCode ?? null,
    website: info.entityURL ?? null,
    contactName: poc ? `${poc.firstName ?? ""} ${poc.lastName ?? ""}`.trim() || null : null,
    contactEmail: poc?.email ?? null,
    naicsCodes,
    naicsPrimary,
    naicsDescription,
    businessTypes,
    sbaDesignations,
    entityStructure: general.entityStructureDesc ?? general.organizationStructureDesc ?? null,
    registrationDate: reg.registrationDate ? new Date(reg.registrationDate) : null,
    samRegistered: true,
    isActive: true,
  };
}

async function fetchSamPage(
  naicsPrefix: string,
  offset: number,
  limit = 100,
  fromDate?: string // ISO date string for incremental pulls e.g. "2026-03-01"
): Promise<{ entities: SamEntity[]; total: number }> {
  const params = new URLSearchParams({
    api_key: SAM_API_KEY!,
    naicsCode: naicsPrefix,
    includeSections: "entityRegistration,coreData,assertions,pointsOfContact",
    page: String(offset / limit),  // SAM.gov v3: 0-indexed page number
    size: String(limit),           // SAM.gov v3: records per page (max 100)
    registrationStatus: "A",       // Active only
  });

  if (fromDate) {
    params.set("registrationDate", `${fromDate},${new Date().toISOString().slice(0, 10)}`);
  }

  const url = `${SAM_BASE}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SAM.gov API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json() as {
    totalRecords?: number;
    entityData?: SamEntity[];
  };

  return {
    entities: data.entityData ?? [],
    total: data.totalRecords ?? 0,
  };
}

async function importNaicsCode(
  naicsPrefix: string,
  fromDate?: string
): Promise<number> {
  let offset = 0;
  const limit = 100;
  let totalImported = 0;

  // First page to get total
  const first = await fetchSamPage(naicsPrefix, 0, limit, fromDate);
  console.log(`  NAICS ${naicsPrefix}: ${first.total.toLocaleString()} total entities`);

  const pages = Math.ceil(Math.min(first.total, 2000) / limit); // cap at 2000 per NAICS code

  const processPage = async (entities: SamEntity[]) => {
    let saved = 0;
    for (const entity of entities) {
      const data = extractCompanyData(entity, naicsPrefix);
      if (!data) continue;

      try {
        await prisma.company.upsert({
          where: { uei: data.uei },
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
            naicsDescription: data.naicsDescription,
            businessTypes: data.businessTypes,
            sbaDesignations: data.sbaDesignations,
            entityStructure: data.entityStructure,
            registrationDate: data.registrationDate,
            isActive: true,
          },
        });
        saved++;
      } catch {
        // skip individual failures
      }
    }
    return saved;
  };

  // Process first page
  totalImported += await processPage(first.entities);
  offset = limit;

  // Process remaining pages
  for (let p = 1; p < pages; p++) {
    const page = await fetchSamPage(naicsPrefix, offset, limit, fromDate);
    totalImported += await processPage(page.entities);
    offset += limit;

    if (p % 5 === 0) {
      console.log(`    Page ${p + 1}/${pages} — ${totalImported} imported so far`);
    }

    // Small delay to be respectful of rate limits
    await new Promise((r) => setTimeout(r, 100));
  }

  return totalImported;
}

async function main() {
  if (!SAM_API_KEY) {
    console.error("SAM_GOV_API_KEY not set in .env — get a free key at https://sam.gov/content/entity-information");
    console.error("Set it in .env as: SAM_GOV_API_KEY=your_key_here");
    process.exit(1);
  }

  // Optional: pass a from-date argument for incremental monthly updates
  // e.g.: npm run import:sam-companies -- --from=2026-03-01
  const fromArg = process.argv.find((a) => a.startsWith("--from="));
  const fromDate = fromArg ? fromArg.replace("--from=", "") : undefined;

  if (fromDate) {
    console.log(`Incremental pull: new registrations since ${fromDate}`);
  } else {
    console.log("Full import: pulling all active registrations by NAICS sector");
  }

  // De-duplicate NAICS prefixes (same prefix can appear in multiple sectors)
  const uniqueNaics = Array.from(new Set(SECTOR_NAICS.map((s) => s.naicsPrefix)));
  console.log(`Querying ${uniqueNaics.length} NAICS code prefixes...\n`);

  let totalImported = 0;
  for (const naicsPrefix of uniqueNaics) {
    const sector = SECTOR_NAICS.find((s) => s.naicsPrefix === naicsPrefix);
    console.log(`[${sector?.description ?? naicsPrefix}]`);
    try {
      const count = await importNaicsCode(naicsPrefix, fromDate);
      console.log(`  → ${count} companies saved\n`);
      totalImported += count;
    } catch (err) {
      console.error(`  Error on NAICS ${naicsPrefix}:`, err);
    }
  }

  const total = await prisma.company.count({ where: { samRegistered: true } });
  console.log(`\nDone. Total SAM.gov companies in DB: ${total.toLocaleString()}`);
  console.log(`This run imported/updated: ${totalImported.toLocaleString()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
