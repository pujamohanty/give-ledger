import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/irs/organizations/[ein]
 * Returns org detail + filings. Uses local DB as primary, ProPublica as fallback.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ein: string }> }
) {
  const { ein } = await params;
  const cleanEin = ein.replace(/-/g, "");

  // ── Primary: local DB ────────────────────────────────────────────────────
  try {
    const org = await prisma.irsOrganization.findUnique({
      where: { ein: cleanEin },
      include: {
        filings: {
          orderBy: { taxYear: "asc" },
        },
      },
    });

    if (org) {
      // Serialise BigInt fields
      const serialized = {
        organization: {
          ein: org.ein,
          name: org.name,
          address: org.street,
          city: org.city,
          state: org.state,
          zipcode: org.zip,
          subsection_code: org.subsection,
          ntee_code: org.nteeCode,
          deductibility_code: org.deductibility,
          asset_amount: org.assetAmount ? Number(org.assetAmount) : null,
          income_amount: org.incomeAmount ? Number(org.incomeAmount) : null,
          revenue_amount: org.revenueAmount ? Number(org.revenueAmount) : null,
          ruling_date: org.ruling,
          tax_period: org.taxPeriod,
        },
        filings_with_data: org.filings.map((f) => ({
          tax_prd_yr: f.taxYear,
          formtype: f.returnType,
          totrevenue: f.totalRevenue ? Number(f.totalRevenue) : null,
          totfuncexpns: f.totalExpenses ? Number(f.totalExpenses) : null,
          totassetsend: f.totalAssetsEOY ? Number(f.totalAssetsEOY) : null,
          totliabend: f.totalLiabilitiesEOY ? Number(f.totalLiabilitiesEOY) : null,
          pct_compnsatncurrofcr: f.pctOfficerCompensation,
          noemployes: f.employeeCount,
        })),
      };

      return NextResponse.json(serialized);
    }
    // org not found in local DB — fall through to ProPublica
  } catch (localErr) {
    console.error("[IRS org detail] local DB failed, falling back to ProPublica:", localErr);
  }

  // ── Fallback: ProPublica ─────────────────────────────────────────────────
  try {
    const res = await fetch(
      `https://projects.propublica.org/nonprofits/api/v2/organizations/${cleanEin}.json`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
