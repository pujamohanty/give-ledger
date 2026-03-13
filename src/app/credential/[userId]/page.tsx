import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import CredentialClient from "./CredentialClient";

export default async function CredentialPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      donations: {
        include: {
          project: {
            include: {
              ngo: { select: { id: true, orgName: true } },
              milestones: {
                where: { status: "COMPLETED" },
                include: { outputMarkers: true },
              },
            },
          },
        },
      },
      skillContributions: {
        where: { status: "APPROVED" },
        include: { ngo: { select: { orgName: true } } },
      },
      endorsementsReceived: {
        include: {
          ngo: { select: { orgName: true } },
          endorser: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      campaignsCreated: true,
    },
  });

  if (!user) notFound();

  // Aggregate stats
  const totalDonated = user.donations.reduce((sum, d) => sum + d.amount, 0);
  const uniqueNgos = new Set(user.donations.map((d) => d.project.ngo.id));
  const ngoNames = Array.from(
    new Map(user.donations.map((d) => [d.project.ngo.id, d.project.ngo.orgName])).values()
  );
  const uniqueProjectCount = new Set(user.donations.map((d) => d.projectId)).size;
  const campaignRaised = user.campaignsCreated.reduce((s, c) => s + c.raisedAmount, 0);

  // Completed milestones (de-duplicated)
  const seenMilestones = new Set<string>();
  const completedMilestones: {
    projectTitle: string;
    ngoName: string;
    milestoneName: string;
    metrics: string[];
  }[] = [];
  for (const d of user.donations) {
    for (const m of d.project.milestones) {
      if (seenMilestones.has(m.id)) continue;
      seenMilestones.add(m.id);
      completedMilestones.push({
        projectTitle: d.project.title,
        ngoName: d.project.ngo.orgName,
        milestoneName: m.name,
        metrics: m.outputMarkers.map(
          (om) => `${om.value}${om.unit ? " " + om.unit : ""} ${om.label}`
        ),
      });
    }
  }

  const skillCount = user.skillContributions.length;
  const skillCategories = Array.from(
    new Set(user.skillContributions.map((s) => s.skillCategory))
  );
  const skillValue = user.skillContributions.reduce((s, c) => s + (c.monetaryValue ?? 0), 0);

  const isOwner = session?.user?.id === userId;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://give-ledger.vercel.app";
  const memberYear = new Date(user.createdAt).getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />
      <CredentialClient
        credential={{
          userId,
          userName: user.name ?? "Anonymous Donor",
          userImage: user.image,
          memberYear,
          totalDonated,
          uniqueNgoCount: uniqueNgos.size,
          ngoNames,
          uniqueProjectCount,
          completedMilestoneCount: completedMilestones.length,
          completedMilestones,
          skillCount,
          skillCategories,
          skillValue,
          campaignCount: user.campaignsCreated.length,
          campaignRaised,
          endorsementCount: user.endorsementsReceived.length,
          endorsements: user.endorsementsReceived.map((e) => ({
            ngoName: e.ngo.orgName,
            category: e.category,
            note: e.note,
            endorserName: e.endorser.name,
          })),
        }}
        isOwner={isOwner}
        appUrl={appUrl}
      />
    </div>
  );
}
