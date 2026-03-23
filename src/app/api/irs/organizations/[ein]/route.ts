import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/irs/organizations/[ein]
 *
 * Returns full IRS org profile + all filings for chart rendering.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ein: string }> }
) {
  const { ein } = await params;
  const cleanEin = ein.replace(/-/g, "").padStart(9, "0");

  try {
    const organization = await prisma.irsOrganization.findUnique({
      where: { ein: cleanEin },
      include: {
        filings: {
          orderBy: { taxYear: "asc" },
        },
        ngo: {
          select: {
            id: true,
            orgName: true,
            status: true,
            trustScore: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Serialize BigInt values
    const serialized = {
      ...organization,
      assetAmount: organization.assetAmount?.toString() ?? null,
      incomeAmount: organization.incomeAmount?.toString() ?? null,
      revenueAmount: organization.revenueAmount?.toString() ?? null,
      filings: organization.filings.map((f) => ({
        ...f,
        totalRevenue: f.totalRevenue?.toString() ?? null,
        totalExpenses: f.totalExpenses?.toString() ?? null,
        totalAssetsEOY: f.totalAssetsEOY?.toString() ?? null,
        totalAssetsBOY: f.totalAssetsBOY?.toString() ?? null,
        totalLiabilitiesEOY: f.totalLiabilitiesEOY?.toString() ?? null,
        totalLiabilitiesBOY: f.totalLiabilitiesBOY?.toString() ?? null,
        netAssetsEOY: f.netAssetsEOY?.toString() ?? null,
        contributionsAndGrants: f.contributionsAndGrants?.toString() ?? null,
        programServiceRevenue: f.programServiceRevenue?.toString() ?? null,
        investmentIncome: f.investmentIncome?.toString() ?? null,
        otherRevenue: f.otherRevenue?.toString() ?? null,
        salariesAndWages: f.salariesAndWages?.toString() ?? null,
        compensationOfficers: f.compensationOfficers?.toString() ?? null,
        otherExpenses: f.otherExpenses?.toString() ?? null,
      })),
    };

    return NextResponse.json(serialized);
  } catch (error: any) {
    console.error("IRS org detail error:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
  }
}
