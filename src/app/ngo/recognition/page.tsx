import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RecognitionClient from "./RecognitionClient";

export default async function NgoRecognitionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo || ngo.status !== "ACTIVE") redirect("/ngo/dashboard");

  // Get all unique donors who donated to or contributed skills to this NGO
  const [donations, skillContributions] = await Promise.all([
    prisma.donation.findMany({
      where: { project: { ngoId: ngo.id } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            endorsementsReceived: {
              where: { ngoId: ngo.id },
              select: { note: true, category: true, endorsedBy: true },
            },
          },
        },
      },
    }),
    prisma.skillContribution.findMany({
      where: { ngoId: ngo.id, status: "APPROVED" },
      select: { donorId: true },
    }),
  ]);

  // Build donor map
  const donorMap = new Map<
    string,
    {
      id: string;
      name: string | null;
      email: string;
      totalDonated: number;
      donationCount: number;
      approvedSkillCount: number;
      endorsementCount: number;
      existingEndorsement: { note: string | null; category: string } | null;
    }
  >();

  for (const d of donations) {
    const existing = donorMap.get(d.userId);
    if (existing) {
      existing.totalDonated += d.amount;
      existing.donationCount += 1;
    } else {
      // My endorsement of this donor (as the NGO owner / staff)
      const myEndorsement = d.user.endorsementsReceived.find(
        (e) => e.endorsedBy === session.user.id
      );
      donorMap.set(d.userId, {
        id: d.user.id,
        name: d.user.name,
        email: d.user.email,
        totalDonated: d.amount,
        donationCount: 1,
        approvedSkillCount: 0,
        endorsementCount: d.user.endorsementsReceived.length,
        existingEndorsement: myEndorsement
          ? { note: myEndorsement.note, category: myEndorsement.category }
          : null,
      });
    }
  }

  // Count approved skill contributions per donor
  for (const sc of skillContributions) {
    const existing = donorMap.get(sc.donorId);
    if (existing) {
      existing.approvedSkillCount += 1;
    }
  }

  const donors = Array.from(donorMap.values()).sort((a, b) => b.totalDonated - a.totalDonated);

  return <RecognitionClient donors={donors} />;
}
