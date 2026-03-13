import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordSkillContribution } from "@/lib/blockchain";

// PATCH /api/skill/[id] — NGO approves or rejects a skill contribution
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify caller is the NGO that owns this contribution
  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo || ngo.status !== "ACTIVE") {
    return NextResponse.json({ error: "NGO not found or not active" }, { status: 403 });
  }

  const contribution = await prisma.skillContribution.findUnique({ where: { id } });
  if (!contribution || contribution.ngoId !== ngo.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { action, monetaryValue } = body as {
    action: "APPROVE" | "REJECT";
    monetaryValue?: number;
  };

  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json({ error: "action must be APPROVE or REJECT" }, { status: 400 });
  }

  if (action === "APPROVE") {
    // Write to Polygon (real if env vars set, mock otherwise)
    const { txHash } = await recordSkillContribution(
      id,
      contribution.ngoId,
      monetaryValue ?? 0
    );

    const updated = await prisma.skillContribution.update({
      where: { id },
      data: {
        status: "APPROVED",
        monetaryValue: monetaryValue ?? null,
        approvedAt: new Date(),
        txHash,
      },
    });

    // Create blockchain record for the approval
    await prisma.skillBlockchainRecord.create({
      data: {
        skillContributionId: id,
        txHash,
        network: "polygon",
      },
    });

    return NextResponse.json({ contribution: updated });
  } else {
    const updated = await prisma.skillContribution.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    return NextResponse.json({ contribution: updated });
  }
}

// GET /api/skill/[id] — fetch a single skill contribution (NGO or donor)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const contribution = await prisma.skillContribution.findUnique({
    where: { id },
    include: {
      ngo: { select: { orgName: true } },
      project: { select: { title: true } },
      blockchainRecord: true,
    },
  });

  if (!contribution) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only the donor or the NGO can view it
  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  const isOwner =
    contribution.donorId === session.user.id ||
    (ngo && contribution.ngoId === ngo.id);

  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ contribution });
}
