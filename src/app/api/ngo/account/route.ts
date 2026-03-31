import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/ngo/account — delete the logged-in NGO's account and all associated data
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "NGO") {
    return NextResponse.json({ error: "Not an NGO account" }, { status: 403 });
  }

  // Cascade deletes are set up via Prisma relations (onDelete: Cascade on Ngo → User)
  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}
