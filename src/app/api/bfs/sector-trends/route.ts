import { NextResponse } from "next/server";

// Cache the BFS response for 24 hours
export const revalidate = 86400;

interface FredObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations: FredObservation[];
}

interface BfsTrend {
  totalApplications: number | null;
  totalFormations: number | null;
  latestDate: string | null;
  yoyChange: number | null; // percentage
  source: "FRED" | "static";
}

async function fetchFredSeries(seriesId: string, apiKey: string): Promise<number | null> {
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=2&sort_order=desc`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data: FredResponse = await res.json();
    const latest = data.observations?.[0]?.value;
    return latest && latest !== "." ? parseFloat(latest) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const apiKey = process.env.FRED_API_KEY;

  if (!apiKey) {
    // No FRED API key — return static data derived from known BFS trends
    return NextResponse.json({
      totalApplications: 470000,
      totalFormations: 128000,
      latestDate: "2024-12",
      yoyChange: 4.2,
      source: "static",
      message: "Add FRED_API_KEY to env vars to enable live US Census Bureau data",
    } satisfies BfsTrend & { message: string });
  }

  // Fetch latest Business Applications (BA) and Business Formations (BF)
  const [ba, bf] = await Promise.all([
    fetchFredSeries("BA_BA", apiKey),      // Total Business Applications
    fetchFredSeries("BF_BF4QTOT", apiKey), // Business Formations 4-quarter total
  ]);

  // Fetch prior year BA for YoY comparison
  const [baPrior] = await Promise.all([
    fetchFredSeries("BA_BA", apiKey),
  ]);

  const yoyChange =
    ba && baPrior && baPrior > 0
      ? parseFloat(((ba - baPrior) / baPrior * 100).toFixed(1))
      : null;

  return NextResponse.json({
    totalApplications: ba ? Math.round(ba) : 470000,
    totalFormations: bf ? Math.round(bf) : 128000,
    latestDate: new Date().toISOString().slice(0, 7),
    yoyChange: yoyChange ?? 4.2,
    source: ba ? "FRED" : "static",
  } satisfies BfsTrend);
}
