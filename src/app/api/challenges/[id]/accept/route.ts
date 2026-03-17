import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name } = await req.json().catch(() => ({ name: null }));

  const challenge = await prisma.donorChallenge.findUnique({ where: { id } });
  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  await prisma.challengeAcceptance.create({
    data: { challengeId: id, name: name?.trim() || null },
  });

  const count = await prisma.challengeAcceptance.count({ where: { challengeId: id } });
  return NextResponse.json({ count });
}
