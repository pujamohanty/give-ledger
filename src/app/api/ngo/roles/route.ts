import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "NGO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });

  const roles = await prisma.ngoRole.findMany({
    where: { ngoId: ngo.id },
    include: {
      project: { select: { title: true } },
      _count: { select: { applications: true } },
      applications: {
        where: { status: "ACCEPTED" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "NGO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });
  if (ngo.status !== "ACTIVE") {
    return NextResponse.json({ error: "NGO account not yet approved" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, department, roleType, projectId, description, responsibilities,
    skillsRequired, timeCommitment, durationWeeks, isRemote, location,
    openings, applicationDeadline, startDate,
  } = body;

  if (!title || !roleType || !description || !responsibilities || !skillsRequired || !timeCommitment) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const role = await prisma.ngoRole.create({
    data: {
      ngoId: ngo.id,
      projectId: projectId || null,
      title,
      department: department || null,
      roleType,
      description,
      responsibilities,
      skillsRequired,
      timeCommitment,
      durationWeeks: parseInt(durationWeeks) || 4,
      isRemote: isRemote !== false,
      location: location || null,
      openings: parseInt(openings) || 1,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
      startDate: startDate ? new Date(startDate) : null,
      status: "OPEN",
    },
  });

  // Emit activity event
  await prisma.activityEvent.create({
    data: {
      type: "SKILL_OFFER",
      ngoName: ngo.orgName,
      actorId: ngo.id,
      actorType: "NGO",
      actorName: ngo.orgName,
      description: `${ngo.orgName} posted a new opportunity: "${title}"`,
      linkUrl: `/opportunities/${role.id}`,
    },
  }).catch(() => {});

  return NextResponse.json({ id: role.id });
}
