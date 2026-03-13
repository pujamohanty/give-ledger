import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SkillsClient from "./SkillsClient";

export default async function DonorSkillsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch NGOs the donor has donated to (to pre-populate the dropdown)
  const donations = await prisma.donation.findMany({
    where: { userId: session.user.id },
    include: { project: { include: { ngo: { select: { id: true, orgName: true } } } } },
    distinct: ["projectId"],
  });

  // Unique NGOs
  const ngoMap = new Map<string, string>();
  for (const d of donations) {
    ngoMap.set(d.project.ngo.id, d.project.ngo.orgName);
  }

  // Also include all active NGOs so donors can offer skills even without prior donation
  const allNgos = await prisma.ngo.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, orgName: true },
    orderBy: { orgName: "asc" },
  });
  for (const n of allNgos) {
    ngoMap.set(n.id, n.orgName);
  }

  const ngos = Array.from(ngoMap.entries()).map(([id, orgName]) => ({ id, orgName }));

  // Fetch existing skill contributions for this donor
  const contributions = await prisma.skillContribution.findMany({
    where: { donorId: session.user.id },
    include: {
      ngo: { select: { orgName: true } },
      project: { select: { title: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <SkillsClient
      ngos={ngos}
      initialContributions={contributions.map((c) => ({
        id: c.id,
        ngoId: c.ngoId,
        ngoName: c.ngo.orgName,
        projectTitle: c.project?.title ?? null,
        skillCategory: c.skillCategory,
        description: c.description,
        hoursContributed: c.hoursContributed,
        status: c.status,
        monetaryValue: c.monetaryValue,
        txHash: c.txHash,
        submittedAt: c.submittedAt,
        approvedAt: c.approvedAt,
      }))}
    />
  );
}
