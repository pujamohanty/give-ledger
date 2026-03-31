import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CareerCompassClient from "./CareerCompassClient";

export const metadata = {
  title: "Career Compass — GiveLedger",
  description:
    "Use your GiveLedger credential to explore 60+ AI-augmented roles across 12 high-growth US sectors. No specialist background required.",
};

// Revalidate the BFS trend data daily
export const revalidate = 86400;

async function getBfsTrend() {
  try {
    // Self-call to our BFS API route
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://give-ledger.vercel.app";
    const res = await fetch(`${baseUrl}/api/bfs/sector-trends`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("BFS fetch failed");
    return await res.json();
  } catch {
    // Fallback static data
    return {
      totalApplications: 470000,
      totalFormations: 128000,
      latestDate: null,
      yoyChange: 4.2,
      source: "static" as const,
    };
  }
}

export default async function CareerCompassPage() {
  // Auth check for credential status
  let session = null;
  try {
    session = await auth();
  } catch {
    // not logged in
  }

  const userId = session?.user?.id ?? null;

  // Check if user has any completed skill contributions (= has started earning credential)
  let isCredentialed = false;
  if (userId) {
    const credCount = await prisma.skillContribution.count({
      where: { donorId: userId, status: "APPROVED" },
    }).catch(() => 0);
    isCredentialed = credCount > 0;
  }

  const bfsTrend = await getBfsTrend();

  return (
    <CareerCompassClient
      bfsTrend={bfsTrend}
      isCredentialed={isCredentialed}
      hasAccount={!!userId}
    />
  );
}
