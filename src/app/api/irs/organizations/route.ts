import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";

/**
 * GET /api/irs/organizations
 *
 * Search and browse 1.8M IRS tax-exempt organizations.
 * Supports text search, state/NTEE/subsection filters, pagination, and sorting.
 *
 * Query params:
 *   q          - Search by org name (case-insensitive substring)
 *   state      - Filter by 2-letter state code (e.g., "CA")
 *   ntee       - Filter by NTEE major group letter (e.g., "A", "B")
 *   subsection - Filter by IRC subsection code (e.g., 3 for 501(c)(3))
 *   minRevenue - Minimum revenue filter
 *   maxRevenue - Maximum revenue filter
 *   page       - Page number (1-indexed, default: 1)
 *   pageSize   - Results per page (default: 25, max: 100)
 *   sort       - Sort field: "name", "revenue", "assets" (default: "name")
 *   order      - Sort order: "asc" or "desc" (default: "asc")
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const q = params.get("q")?.trim();
  const state = params.get("state")?.toUpperCase();
  const ntee = params.get("ntee")?.toUpperCase();
  const subsection = params.get("subsection");
  const minRevenue = params.get("minRevenue");
  const maxRevenue = params.get("maxRevenue");
  const page = Math.max(1, parseInt(params.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(params.get("pageSize") || "25", 10)));
  const sort = params.get("sort") || "name";
  const order = params.get("order") === "desc" ? "desc" : "asc";

  // Build where clause
  const where: Prisma.IrsOrganizationWhereInput = {};

  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }
  if (state) {
    where.state = state;
  }
  if (ntee) {
    where.nteeCode = { startsWith: ntee };
  }
  if (subsection) {
    where.subsection = parseInt(subsection, 10);
  }
  if (minRevenue || maxRevenue) {
    where.revenueAmount = {};
    if (minRevenue) where.revenueAmount.gte = BigInt(minRevenue);
    if (maxRevenue) where.revenueAmount.lte = BigInt(maxRevenue);
  }

  // Build orderBy
  const orderByMap: Record<string, Prisma.IrsOrganizationOrderByWithRelationInput> = {
    name: { name: order },
    revenue: { revenueAmount: { sort: order, nulls: "last" } },
    assets: { assetAmount: { sort: order, nulls: "last" } },
  };
  const orderBy = orderByMap[sort] || orderByMap.name;

  try {
    const [organizations, totalCount] = await Promise.all([
      prisma.irsOrganization.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          ein: true,
          name: true,
          city: true,
          state: true,
          zip: true,
          subsection: true,
          nteeCode: true,
          revenueAmount: true,
          assetAmount: true,
          incomeAmount: true,
          deductibility: true,
          ruling: true,
          ngoId: true,
          // Include latest filing for quick financial snapshot
          filings: {
            take: 1,
            orderBy: { taxYear: "desc" },
            select: {
              taxYear: true,
              totalRevenue: true,
              totalExpenses: true,
              totalAssetsEOY: true,
              pctOfficerCompensation: true,
            },
          },
        },
      }),
      prisma.irsOrganization.count({ where }),
    ]);

    // Serialize BigInt values to strings for JSON
    const serialized = organizations.map((org) => ({
      ...org,
      revenueAmount: org.revenueAmount?.toString() ?? null,
      assetAmount: org.assetAmount?.toString() ?? null,
      incomeAmount: org.incomeAmount?.toString() ?? null,
      filings: org.filings.map((f) => ({
        ...f,
        totalRevenue: f.totalRevenue?.toString() ?? null,
        totalExpenses: f.totalExpenses?.toString() ?? null,
        totalAssetsEOY: f.totalAssetsEOY?.toString() ?? null,
      })),
    }));

    return NextResponse.json({
      organizations: serialized,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error: any) {
    console.error("IRS org search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
