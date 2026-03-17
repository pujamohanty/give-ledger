import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const session = await auth();

  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    include: {
      ngo: { select: { id: true, orgName: true } },
      donations: { select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = Date.now();

  const projectData = projects.map((p) => ({
    id: p.id,
    title: p.title,
    ngoId: p.ngo.id,
    ngoName: p.ngo.orgName,
    category: p.category,
    description: p.description,
    raisedAmount: p.raisedAmount,
    goalAmount: p.goalAmount,
    donorCount: new Set(p.donations.map((d) => d.userId)).size,
    daysLeft: p.endDate
      ? Math.max(0, Math.floor((new Date(p.endDate).getTime() - now) / (1000 * 60 * 60 * 24)))
      : 30,
  }));

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />
      <ProjectsClient projects={projectData} />
    </div>
  );
}
