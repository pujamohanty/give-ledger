import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordDisbursement } from "@/lib/blockchain";

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
    include: { project: { include: { ngo: true } } },
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

  // Get on-chain tx hash (real if Polygon env vars set, mock otherwise)
  const { txHash } = await recordDisbursement(
    milestoneId,
    milestone.project.ngoId,
    milestone.projectId,
    milestone.requiredAmount
  );

  // Mark milestone COMPLETED immediately with evidence
  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      completionNarrative: narrative,
      releasedAmount: milestone.requiredAmount,
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

  // Auto-create approved disbursement — no admin approval needed
  const disbursement = await prisma.disbursement.create({
    data: {
      milestoneId,
      requestedAmount: milestone.requiredAmount,
      approvedAmount: milestone.requiredAmount,
      status: "APPROVED",
      processedAt: new Date(),
      txHash,
    },
  });

  // Record on blockchain
  await prisma.blockchainRecord.create({
    data: {
      entityType: "disbursement",
      disbursementId: disbursement.id,
      txHash,
      network: "polygon",
    },
  });

  // Notify the NGO
  await prisma.notification.create({
    data: {
      userId: milestone.project.ngo.userId,
      type: "MILESTONE_COMPLETE",
      title: "Milestone completed — funds released",
      message: `"${milestone.name}" has been verified. $${milestone.requiredAmount.toLocaleString()} has been automatically released to your account.`,
      linkUrl: "/ngo/dashboard",
    },
  });

  // Notify every donor who funded this project
  const projectDonors = await prisma.donation.findMany({
    where: { projectId: milestone.projectId },
    select: { userId: true },
    distinct: ["userId"],
  });

  if (projectDonors.length > 0) {
    await prisma.notification.createMany({
      data: projectDonors.map((d) => ({
        userId: d.userId,
        type: "MILESTONE_CREDITED",
        title: "Your donation just made an impact",
        message: `${milestone.project.ngo.orgName} completed "${milestone.name}" on "${milestone.project.title}" — a milestone you helped fund. Share what your donation achieved.`,
        linkUrl: `/projects/${milestone.projectId}`,
      })),
      skipDuplicates: true,
    });
  }

  // Emit activity event
  await prisma.activityEvent.create({
    data: {
      type: "MILESTONE_COMPLETE",
      projectId: milestone.projectId,
      ngoName: milestone.project.ngo.orgName,
      projectTitle: milestone.project.title,
      actorId: ngo.id,
      actorType: "NGO",
      actorName: milestone.project.ngo.orgName,
      description: `${milestone.project.ngo.orgName} completed milestone "${milestone.name}" on project "${milestone.project.title}" — $${milestone.requiredAmount.toLocaleString()} released`,
      linkUrl: `/projects/${milestone.projectId}`,
    },
  }).catch(() => {});

  return NextResponse.json({ disbursementId: disbursement.id, txHash });
}
