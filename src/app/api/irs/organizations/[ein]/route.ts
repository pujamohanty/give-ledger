import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/irs/organizations/[ein]
 * Proxies ProPublica Nonprofit Explorer organization detail API.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ein: string }> }
) {
  const { ein } = await params;
  const cleanEin = ein.replace(/-/g, "");

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
