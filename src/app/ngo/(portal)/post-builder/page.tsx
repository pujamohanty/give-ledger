import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NgoPostBuilderClient from "./PostBuilderClient";

export default async function NgoPostBuilderPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo || ngo.status !== "ACTIVE") redirect("/ngo/dashboard");

  // Fetch all completed milestones for this NGO
  const milestones = await prisma.milestone.findMany({
    where: {
      status: "COMPLETED",
      project: { ngoId: ngo.id },
    },
    include: {
      outputMarkers: true,
      project: {
        include: {
          donations: {
            include: { user: { select: { name: true } } },
          },
        },
      },
      disbursement: {
        include: { blockchainRecord: true },
      },
    },
    orderBy: { completedAt: "desc" },
  });

  const posts = milestones.map((m) => {
    const txHash = m.disbursement?.blockchainRecord?.txHash ?? m.disbursement?.txHash ?? null;
    const donors = m.project.donations;
    const donorCount = new Set(donors.map((d) => d.userId)).size;
    const topDonors = Array.from(new Set(
      donors.map((d) => d.user.name).filter((n): n is string => n !== null)
    )).slice(0, 3);

    return {
      projectTitle: m.project.title,
      ngoName: ngo.orgName,
      milestoneName: m.name,
      narrative: m.completionNarrative,
      metrics: m.outputMarkers.map(
        (om) => `${om.value}${om.unit ? " " + om.unit : ""} ${om.label}`
      ),
      txHash,
      donorCount,
      topDonors,
    };
  });

  return <NgoPostBuilderClient milestones={posts} ngoName={ngo.orgName} />;
}
