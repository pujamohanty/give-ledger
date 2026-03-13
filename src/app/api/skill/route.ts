import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/skill — donor submits a skill contribution offer
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { ngoId, projectId, skillCategory, description, hoursContributed } = body as {
    ngoId: string;
    projectId?: string;
    skillCategory: string;
    description: string;
    hoursContributed?: number;
  };

  if (!ngoId?.trim() || !skillCategory?.trim() || !description?.trim()) {
    return NextResponse.json(
      { error: "ngoId, skillCategory, and description are required" },
      { status: 400 }
    );
  }

  // Verify NGO exists and is active
  const ngo = await prisma.ngo.findUnique({ where: { id: ngoId } });
  if (!ngo || ngo.status !== "ACTIVE") {
    return NextResponse.json({ error: "NGO not found or not active" }, { status: 404 });
  }

  // If projectId provided, verify it belongs to the NGO
  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.ngoId !== ngoId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const contribution = await prisma.skillContribution.create({
    data: {
      donorId: session.user.id,
      ngoId,
      projectId: projectId ?? null,
      skillCategory,
      description: description.trim(),
      hoursContributed: hoursContributed ?? null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ contribution });
}

// GET /api/skill — donor fetches their own skill contributions
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contributions = await prisma.skillContribution.findMany({
    where: { donorId: session.user.id },
    include: {
      ngo: { select: { orgName: true } },
      project: { select: { title: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ contributions });
}
