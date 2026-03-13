import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SkillsReviewClient from "./SkillsReviewClient";

export default async function NgoSkillsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo || ngo.status !== "ACTIVE") redirect("/ngo/dashboard");

  const contributions = await prisma.skillContribution.findMany({
    where: { ngoId: ngo.id },
    include: {
      donor: { select: { name: true, email: true } },
      project: { select: { title: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <SkillsReviewClient
      initialOffers={contributions.map((c) => ({
        id: c.id,
        donorName: c.donor.name,
        donorEmail: c.donor.email,
        projectTitle: c.project?.title ?? null,
        skillCategory: c.skillCategory,
        description: c.description,
        hoursContributed: c.hoursContributed,
        status: c.status,
        monetaryValue: c.monetaryValue,
        txHash: c.txHash,
        submittedAt: c.submittedAt,
      }))}
    />
  );
}
