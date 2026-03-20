import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/donor/share-track
// body: { type: "training" | "beta" }
// Increments the share count and recalculates impact score (max 20: 10 from training + 10 from beta)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DONOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type } = body;

  if (type !== "training" && type !== "beta") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { trainingShareCount: true, betaShareCount: true },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newTraining = type === "training" ? user.trainingShareCount + 1 : user.trainingShareCount;
  const newBeta     = type === "beta"     ? user.betaShareCount + 1     : user.betaShareCount;
  const newScore    = Math.min(newTraining, 10) + Math.min(newBeta, 10);

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      trainingShareCount: newTraining,
      betaShareCount: newBeta,
      impactScore: newScore,
    },
    select: { trainingShareCount: true, betaShareCount: true, impactScore: true },
  });

  return NextResponse.json(updated);
}
