import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/irs/organizations
 * Proxies ProPublica Nonprofit Explorer search API.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const q = params.get("q") ?? "";
  const state = params.get("state") ?? "";
  const ntee = params.get("ntee") ?? "";
  const page = params.get("page") ?? "0";

  const url = new URL("https://projects.propublica.org/nonprofits/api/v2/search.json");
  if (q) url.searchParams.set("q", q);
  if (state) url.searchParams.set("state[id]", state);
  if (ntee) url.searchParams.set("ntee[id]", ntee);
  url.searchParams.set("page", page);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // cache 1 hour
    });
    if (!res.ok) return NextResponse.json({ organizations: [], total_results: 0 }, { status: 200 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ organizations: [], total_results: 0 });
  }
}
