import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const disbursements = await prisma.disbursement.findMany({
    include: {
      milestone: {
        include: {
          project: { include: { ngo: { select: { orgName: true } } } },
          outputMarkers: true,
          evidenceFiles: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(disbursements);
}
