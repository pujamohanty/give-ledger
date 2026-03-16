import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Lightweight list of NGO's projects for dropdowns
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "NGO") {
    return NextResponse.json([]);
  }

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json([]);

  const projects = await prisma.project.findMany({
    where: { ngoId: ngo.id, status: { in: ["ACTIVE", "PENDING_REVIEW"] } },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}
