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

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      ngo: true,
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
      donations: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!project) notFound();

  const now = Date.now();
  const daysLeft = project.endDate
    ? Math.max(0, Math.floor((new Date(project.endDate).getTime() - now) / (1000 * 60 * 60 * 24)))
    : 30;

  const donorCount = new Set(project.donations.map((d) => d.userId)).size;

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
      orgName: project.ngo.orgName,
      description: project.ngo.description,
      country: project.ngo.country,
      website: project.ngo.website,
      foundedYear: project.ngo.approvedAt
        ? new Date(project.ngo.approvedAt).getFullYear().toString()
        : new Date(project.ngo.createdAt).getFullYear().toString(),
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
    recentDonations: project.donations.map((d) => ({
      name: d.user.name ?? "Anonymous",
      amount: d.amount,
      createdAt: d.createdAt,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />
      <ProjectDetailClient project={projectData} />
    </div>
  );
}
