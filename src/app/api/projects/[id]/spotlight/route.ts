import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  try {
    await prisma.spotlightVote.create({
      data: {
        projectId,
        userId: session.user.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });
    await prisma.project.update({
      where: { id: projectId },
      data: { spotlightVoteCount: { increment: 1 } },
    });
  } catch {
    // Unique constraint — user already voted, silently succeed
  }

  const updated = await prisma.project.findUnique({
    where: { id: projectId },
    select: { spotlightVoteCount: true },
  });

  return NextResponse.json({ voteCount: updated?.spotlightVoteCount ?? 0 });
}
