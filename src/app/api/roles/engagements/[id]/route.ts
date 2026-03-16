import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMockTxHash } from "@/lib/utils";

// PATCH: log hours (donor) or complete engagement (NGO)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: engagementId } = await params;
  const body = await req.json();
  const { action } = body;

  const engagement = await prisma.roleEngagement.findUnique({
    where: { id: engagementId },
    include: {
      application: {
        include: {
          role: { include: { ngo: true } },
          applicant: { select: { id: true, name: true } },
        },
      },
    },
  });
  if (!engagement) return NextResponse.json({ error: "Engagement not found" }, { status: 404 });

  const role = engagement.application.role;
  const ngo = role.ngo;
  const applicant = engagement.application.applicant;

  // Log hours — donor only
  if (action === "logHours") {
    if (session.user.id !== applicant.id) {
      return NextResponse.json({ error: "Only the contributor can log hours" }, { status: 403 });
    }
    const { hours, workSummary } = body;
    const updated = await prisma.roleEngagement.update({
      where: { id: engagementId },
      data: {
        hoursLogged: { increment: parseFloat(hours) || 0 },
        workSummary: workSummary || engagement.workSummary,
      },
    });
    return NextResponse.json(updated);
  }

  // Complete engagement — NGO only
  if (action === "complete") {
    const ngoRecord = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
    if (!ngoRecord || ngoRecord.id !== ngo.id) {
      return NextResponse.json({ error: "Only the NGO can complete an engagement" }, { status: 403 });
    }
    if (engagement.status !== "ACTIVE") {
      return NextResponse.json({ error: "Engagement is not active" }, { status: 409 });
    }

    const { monetaryValue, ngoFeedback, skillCategory } = body;

    // Create SkillContribution record
    const skillContribution = await prisma.skillContribution.create({
      data: {
        donorId: applicant.id,
        ngoId: ngo.id,
        projectId: role.projectId || null,
        skillCategory: skillCategory || "OTHER",
        description: `${role.title} — ${role.timeCommitment} for ${role.durationWeeks} weeks. ${engagement.workSummary ?? ""}`.trim(),
        hoursContributed: engagement.hoursLogged,
        status: "APPROVED",
        monetaryValue: parseFloat(monetaryValue) || null,
        txHash: generateMockTxHash(),
        approvedAt: new Date(),
      },
    });

    // Create DonorEndorsement
    await prisma.donorEndorsement.create({
      data: {
        donorId: applicant.id,
        ngoId: ngo.id,
        endorsedBy: session.user.id,
        note: ngoFeedback || `Completed "${role.title}" with ${engagement.hoursLogged} hours contributed.`,
        category: "SKILL",
      },
    }).catch(() => {}); // may fail if duplicate — ignore

    // Mark engagement complete
    await prisma.roleEngagement.update({
      where: { id: engagementId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        ngoFeedback: ngoFeedback || null,
        monetaryValue: parseFloat(monetaryValue) || null,
        skillContributionId: skillContribution.id,
      },
    });

    // Notify contributor
    await prisma.notification.create({
      data: {
        userId: applicant.id,
        type: "ROLE_COMPLETED",
        title: "Engagement completed!",
        message: `${ngo.orgName} has confirmed your contribution to "${role.title}". It's now on your record.`,
        linkUrl: `/donor/credential`,
      },
    }).catch(() => {});

    // Activity event
    await prisma.activityEvent.create({
      data: {
        type: "SKILL_APPROVED",
        ngoName: ngo.orgName,
        actorId: applicant.id,
        actorType: "USER",
        actorName: applicant.name ?? "A contributor",
        description: `${applicant.name ?? "A contributor"} completed "${role.title}" at ${ngo.orgName}`,
        linkUrl: `/opportunities/${role.id}`,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, skillContributionId: skillContribution.id });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
