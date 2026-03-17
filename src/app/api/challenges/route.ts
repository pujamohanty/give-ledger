import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "DONOR") return NextResponse.json({ error: "Donors only" }, { status: 403 });

  const { projectId, amount, message, deadline } = await req.json();
  if (!projectId || !amount || amount <= 0) {
    return NextResponse.json({ error: "projectId and amount are required" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const challenge = await prisma.donorChallenge.create({
    data: {
      donorId: session.user.id,
      projectId,
      amount: parseFloat(amount),
      message: message?.trim() || null,
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  return NextResponse.json({ id: challenge.id });
}
