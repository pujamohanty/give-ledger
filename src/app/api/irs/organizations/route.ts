import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PER_PAGE = 25;

/**
 * GET /api/irs/organizations
 * Search IRS nonprofits. Uses local DB (IrsOrganization) as primary source.
 * Falls back to ProPublica API if local query fails.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const q = params.get("q") ?? "";
  const state = params.get("state") ?? "";
  const ntee = params.get("ntee") ?? "";
  const page = parseInt(params.get("page") ?? "0", 10);

  // ── Primary: local DB ────────────────────────────────────────────────────
  try {
    const where: Record<string, unknown> = {};
    if (q) where.name = { contains: q, mode: "insensitive" };
    if (state) where.state = state;
    if (ntee) where.nteeCode = { startsWith: ntee };

    const [organizations, total_results] = await Promise.all([
      prisma.irsOrganization.findMany({
        where,
        skip: page * PER_PAGE,
        take: PER_PAGE,
        orderBy: [{ revenueAmount: "desc" }, { name: "asc" }],
        select: {
          ein: true,
          name: true,
          city: true,
          state: true,
          nteeCode: true,
          subsection: true,
          revenueAmount: true,
          assetAmount: true,
        },
      }),
      prisma.irsOrganization.count({ where }),
    ]);

    // BigInt → number for JSON serialisation
    const serialized = organizations.map((o) => ({
      ...o,
      revenueAmount: o.revenueAmount ? Number(o.revenueAmount) : null,
      assetAmount: o.assetAmount ? Number(o.assetAmount) : null,
      subsection_code: o.subsection,
      ntee_code: o.nteeCode,
    }));

    return NextResponse.json({ organizations: serialized, total_results });
  } catch (localErr) {
    console.error("[IRS orgs] local DB failed, falling back to ProPublica:", localErr);
  }

  // ── Fallback: ProPublica ─────────────────────────────────────────────────
  try {
    const url = new URL("https://projects.propublica.org/nonprofits/api/v2/search.json");
    if (q) url.searchParams.set("q", q);
    if (state) url.searchParams.set("state[id]", state);
    if (ntee) url.searchParams.set("ntee[id]", ntee);
    url.searchParams.set("page", String(page));

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return NextResponse.json({ organizations: [], total_results: 0 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ organizations: [], total_results: 0 });
  }
}
