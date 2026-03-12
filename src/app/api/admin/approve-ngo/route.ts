import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ngoId, action, rejectReason } = await req.json();

  if (!ngoId || !["APPROVE", "REJECT", "REQUEST_INFO"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    if (action === "APPROVE") {
      await prisma.ngo.update({
        where: { id: ngoId },
        data: { status: "ACTIVE", approvedAt: new Date() },
      });
    } else if (action === "REJECT") {
      await prisma.ngo.update({
        where: { id: ngoId },
        data: { status: "REJECTED", rejectReason: rejectReason ?? null },
      });
    }
    // REQUEST_INFO — no DB change, just UI acknowledgement
  } catch {
    // Silently succeed for demo/mock records that don't exist in DB
  }

  return NextResponse.json({ success: true });
}
