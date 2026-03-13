import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/ngo/skills — NGO fetches all skill contributions for their org
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo || ngo.status !== "ACTIVE") {
    return NextResponse.json({ error: "NGO not found or not active" }, { status: 403 });
  }

  const contributions = await prisma.skillContribution.findMany({
    where: { ngoId: ngo.id },
    include: {
      donor: { select: { name: true, email: true } },
      project: { select: { title: true } },
      blockchainRecord: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ contributions });
}
