import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ngos = await prisma.ngo.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { email: true, name: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(ngos);
}
