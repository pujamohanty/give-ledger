import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "DONOR") return NextResponse.json({ error: "Donors only" }, { status: 403 });

  const body = await req.json();
  const { challengeType = "FINANCIAL", message, deadline } = body;

  if (challengeType === "FINANCIAL") {
    const { projectId, amount } = body;
    if (!projectId || !amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "projectId and amount are required" }, { status: 400 });
    }
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const challenge = await prisma.donorChallenge.create({
      data: {
        donorId: session.user.id,
        challengeType: "FINANCIAL",
        projectId,
        amount: parseFloat(amount),
        message: message?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
      },
    });
    return NextResponse.json({ id: challenge.id });
  }

  if (challengeType === "SKILL") {
    const { ngoId, skillCategory, hoursContributed, roleId } = body;
    if (!ngoId || !skillCategory) {
      return NextResponse.json({ error: "ngoId and skillCategory are required" }, { status: 400 });
    }
    const ngo = await prisma.ngo.findUnique({ where: { id: ngoId } });
    if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });

    const challenge = await prisma.donorChallenge.create({
      data: {
        donorId: session.user.id,
        challengeType: "SKILL",
        ngoId,
        roleId: roleId || null,
        skillCategory,
        hoursContributed: hoursContributed ? parseFloat(hoursContributed) : null,
        message: message?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
      },
    });
    return NextResponse.json({ id: challenge.id });
  }

  return NextResponse.json({ error: "Invalid challengeType" }, { status: 400 });
}
