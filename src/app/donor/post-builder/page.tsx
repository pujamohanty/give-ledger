import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PostBuilderClient from "./PostBuilderClient";

export default async function PostBuilderPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [user, donations, skills, endorsements, campaigns] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.donation.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            ngo: { select: { id: true, orgName: true } },
            milestones: {
              where: { status: "COMPLETED" },
              include: { outputMarkers: true, disbursement: { include: { blockchainRecord: true } } },
            },
          },
        },
      },
    }),
    prisma.skillContribution.findMany({
      where: { donorId: userId, status: "APPROVED" },
      include: { ngo: { select: { orgName: true } } },
    }),
    prisma.donorEndorsement.findMany({
      where: { donorId: userId },
      include: { ngo: { select: { orgName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.campaign.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const uniqueProjects = new Set(donations.map((d) => d.projectId)).size;
  const uniqueNgos = new Set(donations.map((d) => d.project.ngo.id)).size;

  // Collect completed milestones de-duplicated
  const milestoneMap = new Map<string, {
    projectTitle: string;
    ngoName: string;
    milestoneName: string;
    metrics: string[];
    txHash: string | null;
  }>();

  for (const d of donations) {
    for (const m of d.project.milestones) {
      if (milestoneMap.has(m.id)) continue;
      const txHash = m.disbursement?.blockchainRecord?.txHash ?? m.disbursement?.txHash ?? null;
      milestoneMap.set(m.id, {
        projectTitle: d.project.title,
        ngoName: d.project.ngo.orgName,
        milestoneName: m.name,
        metrics: m.outputMarkers.map(
          (om) => `${om.value}${om.unit ? " " + om.unit : ""} ${om.label}`
        ),
        txHash,
      });
    }
  }

  return (
    <PostBuilderClient
      postData={{
        donorName: user?.name ?? "Donor",
        totalDonated,
        projectsCount: uniqueProjects,
        ngosCount: uniqueNgos,
        completedMilestones: Array.from(milestoneMap.values()),
        approvedSkills: skills.map((s) => ({
          skillCategory: s.skillCategory,
          ngoName: s.ngo.orgName,
        })),
        endorsements: endorsements.map((e) => ({
          ngoName: e.ngo.orgName,
          category: e.category,
          note: e.note,
        })),
        campaigns: campaigns.map((c) => ({
          title: c.title,
          raisedAmount: c.raisedAmount,
        })),
        userId,
      }}
    />
  );
}
