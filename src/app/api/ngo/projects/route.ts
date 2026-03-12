import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "NGO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json([]);

  const projects = await prisma.project.findMany({
    where: { ngoId: ngo.id, status: { in: ["ACTIVE", "PENDING_REVIEW"] } },
    include: {
      milestones: {
        where: { status: "PENDING" },
        orderBy: { orderIndex: "asc" },
        select: { id: true, name: true, requiredAmount: true, targetDate: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}
