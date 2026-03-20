import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description, projectId, goalAmount, daysRunning } = body;

  if (!title || !projectId || !goalAmount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const endsAt = daysRunning
    ? new Date(Date.now() + Number(daysRunning) * 24 * 60 * 60 * 1000)
    : null;

  const campaign = await prisma.campaign.create({
    data: {
      creatorId: session.user.id,
      projectId,
      title,
      description: description ?? "",
      goalAmount: parseFloat(goalAmount),
      endsAt,
    },
  });

  // Update impact score — campaigns boost it
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { campaignCount: true, trainingShareCount: true, betaShareCount: true },
  });
  if (user) {
    const newCount = user.campaignCount + 1;
    const newScore = Math.min(user.trainingShareCount, 10) + Math.min(user.betaShareCount, 10) + Math.min(newCount, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { campaignCount: newCount, impactScore: newScore },
    });
  }

  return NextResponse.json({ campaignId: campaign.id });
}
