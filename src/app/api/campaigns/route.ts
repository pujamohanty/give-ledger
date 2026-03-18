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

  return NextResponse.json({ campaignId: campaign.id });
}
