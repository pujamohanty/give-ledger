import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/endorsements — NGO staff member endorses a donor
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Caller must be an NGO user
  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo || ngo.status !== "ACTIVE") {
    return NextResponse.json({ error: "Only active NGO accounts can endorse donors" }, { status: 403 });
  }

  const body = await req.json();
  const { donorId, note, category } = body as {
    donorId: string;
    note?: string;
    category?: string;
  };

  if (!donorId?.trim()) {
    return NextResponse.json({ error: "donorId is required" }, { status: 400 });
  }

  // Verify the donor has actually donated to this NGO
  const hasDonated = await prisma.donation.findFirst({
    where: {
      userId: donorId,
      project: { ngoId: ngo.id },
    },
  });

  // Also check if they have an approved skill contribution
  const hasSkill = await prisma.skillContribution.findFirst({
    where: { donorId, ngoId: ngo.id, status: "APPROVED" },
  });

  if (!hasDonated && !hasSkill) {
    return NextResponse.json(
      { error: "Can only endorse donors who have donated to or contributed skills to your NGO" },
      { status: 400 }
    );
  }

  // Upsert — if already endorsed, update the note/category
  const endorsement = await prisma.donorEndorsement.upsert({
    where: {
      donorId_ngoId_endorsedBy: {
        donorId,
        ngoId: ngo.id,
        endorsedBy: session.user.id,
      },
    },
    update: {
      note: note?.trim() || null,
      category: category ?? "GENERAL",
    },
    create: {
      donorId,
      ngoId: ngo.id,
      endorsedBy: session.user.id,
      note: note?.trim() || null,
      category: category ?? "GENERAL",
    },
  });

  return NextResponse.json({ endorsement });
}

// GET /api/endorsements — NGO fetches all endorsements they've given
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo || ngo.status !== "ACTIVE") {
    return NextResponse.json({ error: "NGO not found or not active" }, { status: 403 });
  }

  // Get all donors for this NGO with their endorsement count and breakdown
  const donors = await prisma.donation.findMany({
    where: { project: { ngoId: ngo.id } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          endorsementsReceived: {
            where: { ngoId: ngo.id },
          },
        },
      },
    },
    distinct: ["userId"],
  });

  return NextResponse.json({ donors });
}
