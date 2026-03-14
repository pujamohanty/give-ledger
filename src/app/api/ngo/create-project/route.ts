import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "NGO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, category, description, goalAmount, startDate, endDate, milestones } = body;

  if (!title || !category || !description || !goalAmount || !milestones?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) {
    return NextResponse.json({ error: "NGO profile not found" }, { status: 404 });
  }
  if (ngo.status !== "ACTIVE") {
    return NextResponse.json({ error: "NGO account not yet approved" }, { status: 403 });
  }

  const project = await prisma.project.create({
    data: {
      ngoId: ngo.id,
      title,
      category,
      description,
      goalAmount: parseFloat(goalAmount),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: "PENDING_REVIEW",
      milestones: {
        create: milestones.map((m: { name: string; description: string; targetDate: string; requiredAmount: string }, i: number) => ({
          name: m.name,
          description: m.description,
          targetDate: m.targetDate ? new Date(m.targetDate) : null,
          requiredAmount: parseFloat(m.requiredAmount),
          orderIndex: i,
          status: "PENDING",
        })),
      },
    },
    select: { id: true },
  });

  // Emit activity event
  await prisma.activityEvent.create({
    data: {
      type: "PROJECT_LAUNCH",
      projectId: project.id,
      ngoName: ngo.orgName,
      projectTitle: title,
      actorId: ngo.id,
      actorType: "NGO",
      actorName: ngo.orgName,
      description: `${ngo.orgName} launched a new project: "${title}"`,
      linkUrl: `/projects/${project.id}`,
    },
  }).catch(() => {});

  return NextResponse.json({ id: project.id });
}
