import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CampaignForm from "./CampaignForm";

export type ProjectForCampaign = {
  id: string;
  title: string;
  ngoName: string;
  raisedAmount: number;
  goalAmount: number;
  roles: {
    id: string;
    title: string;
    roleType: string;
    timeCommitment: string;
    durationWeeks: number;
    isRemote: boolean;
    skillsRequired: string;
  }[];
};

export default async function DonorNewCampaignPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rawProjects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    include: {
      ngo: { select: { orgName: true } },
      roles: {
        where: { status: "OPEN" },
        select: {
          id: true,
          title: true,
          roleType: true,
          timeCommitment: true,
          durationWeeks: true,
          isRemote: true,
          skillsRequired: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const projects: ProjectForCampaign[] = rawProjects.map((p) => ({
    id: p.id,
    title: p.title,
    ngoName: p.ngo.orgName,
    raisedAmount: p.raisedAmount,
    goalAmount: p.goalAmount,
    roles: p.roles,
  }));

  return <CampaignForm projects={projects} />;
}
