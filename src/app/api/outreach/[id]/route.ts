import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH — update status or notes on an outreach contact
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as { status?: string; notes?: string; roleTitleRef?: string };

  // Verify ownership before updating
  const existing = await prisma.outreachContact.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const contact = await prisma.outreachContact.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status as "SAVED" | "REACHED_OUT" | "RESPONDED" | "IN_CONVERSATION" } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.roleTitleRef !== undefined ? { roleTitleRef: body.roleTitleRef } : {}),
    },
  });

  return NextResponse.json({ contact });
}
