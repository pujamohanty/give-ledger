import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateMockTxHash } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { disbursementId, action, rejectReason } = await req.json();

  if (!disbursementId || !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    if (action === "APPROVE") {
      const txHash = generateMockTxHash();

      const disbursement = await prisma.disbursement.update({
        where: { id: disbursementId },
        data: {
          status: "APPROVED",
          approvedBy: session.user.id,
          processedAt: new Date(),
          txHash,
        },
        include: {
          milestone: {
            include: { project: { include: { ngo: true } } },
          },
        },
      });

      await prisma.milestone.update({
        where: { id: disbursement.milestoneId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      await prisma.blockchainRecord.create({
        data: {
          entityType: "disbursement",
          disbursementId: disbursement.id,
          txHash,
          network: "polygon",
        },
      });

      // Notify the NGO user
      await prisma.notification.create({
        data: {
          userId: disbursement.milestone.project.ngo.userId,
          type: "MILESTONE_COMPLETE",
          title: "Milestone approved — funds released",
          message: `"${disbursement.milestone.name}" has been verified. $${disbursement.requestedAmount.toLocaleString()} has been released to your account.`,
          linkUrl: "/ngo/dashboard",
        },
      });

      return NextResponse.json({ success: true, txHash });
    } else {
      const disbursement = await prisma.disbursement.update({
        where: { id: disbursementId },
        data: {
          status: "REJECTED",
          rejectReason: rejectReason ?? null,
          processedAt: new Date(),
        },
      });

      await prisma.milestone.update({
        where: { id: disbursement.milestoneId },
        data: { status: "PENDING" },
      });

      return NextResponse.json({ success: true });
    }
  } catch {
    // Silently succeed for demo/mock records that don't exist in DB
    return NextResponse.json({ success: true });
  }
}
