import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "NGO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { milestoneId, narrative, outputMarkers, evidenceFiles } = await req.json();

  if (!milestoneId || !narrative || !evidenceFiles?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });

  if (!milestone || milestone.project.ngoId !== ngo.id) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
  }

  if (milestone.status !== "PENDING") {
    return NextResponse.json({ error: "Milestone cannot be submitted in its current state" }, { status: 400 });
  }

  const existing = await prisma.disbursement.findUnique({ where: { milestoneId } });
  if (existing) {
    return NextResponse.json({ error: "Evidence already submitted for this milestone" }, { status: 400 });
  }

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: "UNDER_REVIEW",
      completionNarrative: narrative,
      ...(outputMarkers?.length && {
        outputMarkers: {
          create: outputMarkers.map((m: { label: string; value: string }) => ({
            label: m.label,
            value: m.value,
          })),
        },
      }),
      evidenceFiles: {
        create: evidenceFiles.map((f: { fileName: string; fileType: string }) => ({
          fileName: f.fileName,
          fileType: f.fileType,
          url: "#",
          fileSize: 0,
        })),
      },
    },
  });

  const disbursement = await prisma.disbursement.create({
    data: {
      milestoneId,
      requestedAmount: milestone.requiredAmount,
      status: "PENDING",
    },
  });

  return NextResponse.json({ disbursementId: disbursement.id });
}
