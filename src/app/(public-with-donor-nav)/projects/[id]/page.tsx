import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ProjectDetailClient from "./ProjectDetailClient";

const categoryLabel: Record<string, string> = {
  INCOME_GENERATION: "Income Generation",
  CHILD_CARE: "Child Care",
  ELDERLY_CARE: "Elderly Care",
  PHYSICALLY_DISABLED: "Accessibility",
  PET_CARE: "Animal Welfare",
  OTHER: "Other",
};

const categoryEmoji: Record<string, string> = {
  INCOME_GENERATION: "🧵",
  CHILD_CARE: "💧",
  ELDERLY_CARE: "🏠",
  PHYSICALLY_DISABLED: "♿",
  PET_CARE: "🐾",
  OTHER: "🌱",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const [project, allDonations, skillContributors] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        ngo: {
          include: {
            boardMembers: { orderBy: { orderIndex: "asc" } },
            roles: {
              where: { status: "OPEN" },
              select: {
                id: true, title: true, roleType: true, timeCommitment: true,
                skillsRequired: true, isRemote: true, salaryMin: true, salaryMax: true,
                durationWeeks: true,
              },
              take: 12,
            },
          },
        },
        milestones: {
          include: {
            outputMarkers: true,
            evidenceFiles: true,
            disbursement: {
              include: { blockchainRecord: true },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    }),
    prisma.donation.findMany({
      where: { projectId: id },
      include: {
        user: { select: { id: true, name: true, jobTitle: true, company: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.skillContribution.findMany({
      where: { projectId: id, status: "APPROVED" },
      include: {
        donor: { select: { id: true, name: true, jobTitle: true, company: true } },
      },
      orderBy: { approvedAt: "desc" },
    }),
  ]);

  if (!project) notFound();

  const now = Date.now();
  const daysLeft = project.endDate
    ? Math.max(0, Math.floor((new Date(project.endDate).getTime() - now) / (1000 * 60 * 60 * 24)))
    : 30;

  // Build financial leaderboard — group by donor, sort by total donated desc
  const donorMap = new Map<string, {
    id: string; name: string; jobTitle: string | null; company: string | null;
    total: number; firstAt: Date;
  }>();
  for (const d of allDonations) {
    const ex = donorMap.get(d.userId);
    if (ex) {
      ex.total += d.amount;
    } else {
      donorMap.set(d.userId, {
        id: d.user.id, name: d.user.name ?? "Anonymous",
        jobTitle: d.user.jobTitle, company: d.user.company,
        total: d.amount, firstAt: new Date(d.createdAt),
      });
    }
  }
  const financialLeaderboard = Array.from(donorMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 15);

  const donorCount = donorMap.size;

  const projectData = {
    id: project.id,
    title: project.title,
    description: project.description,
    category: categoryLabel[project.category] ?? project.category,
    image: categoryEmoji[project.category] ?? "🌱",
    raisedAmount: project.raisedAmount,
    goalAmount: project.goalAmount,
    donorCount,
    daysLeft,
    ngo: {
      id: project.ngo.id,
      orgName: project.ngo.orgName,
      description: project.ngo.description,
      country: project.ngo.country,
      website: project.ngo.website,
      foundedYear: project.ngo.approvedAt
        ? new Date(project.ngo.approvedAt).getFullYear().toString()
        : new Date(project.ngo.createdAt).getFullYear().toString(),
      boardMembers: project.ngo.boardMembers.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        bio: m.bio,
        linkedinUrl: m.linkedinUrl,
        photoUrl: m.photoUrl,
      })),
    },
    milestones: project.milestones.map((m) => {
      const txHash = m.disbursement?.blockchainRecord?.txHash ?? m.disbursement?.txHash ?? null;
      const firstMetric =
        m.outputMarkers[0]
          ? `${m.outputMarkers[0].value}${m.outputMarkers[0].unit ? " " + m.outputMarkers[0].unit : ""} — ${m.outputMarkers[0].label}`
          : null;
      return {
        id: m.id,
        name: m.name,
        status: m.status,
        targetDate: m.targetDate ? new Date(m.targetDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null,
        requiredAmount: m.requiredAmount,
        txHash,
        metric: firstMetric,
        narrative: m.completionNarrative,
        evidenceFiles: m.evidenceFiles.map((f) => ({
          fileName: f.fileName,
          fileType: f.fileType,
          url: f.url,
        })),
        outputMarkers: m.outputMarkers.map((om) => ({
          label: om.label,
          value: om.value,
          unit: om.unit,
        })),
      };
    }),
    ngoRoles: project.ngo.roles.map((r) => ({
      id: r.id,
      title: r.title,
      roleType: r.roleType as string,
      timeCommitment: r.timeCommitment,
      skillsRequired: r.skillsRequired,
      isRemote: r.isRemote,
      salaryMin: r.salaryMin,
      salaryMax: r.salaryMax,
      durationWeeks: r.durationWeeks,
    })),
    financialLeaderboard,
    skillContributors: skillContributors.map((c) => ({
      id: c.donorId,
      name: c.donor.name ?? "Anonymous",
      jobTitle: c.donor.jobTitle,
      company: c.donor.company,
      skillCategory: c.skillCategory,
      hoursContributed: c.hoursContributed,
      monetaryValue: c.monetaryValue,
    })),
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />
      <ProjectDetailClient project={projectData} />
    </div>
  );
}
