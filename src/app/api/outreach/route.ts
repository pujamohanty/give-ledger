import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — list current user's outreach contacts
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contacts = await prisma.outreachContact.findMany({
    where: { userId: session.user.id },
    include: { company: { select: { id: true, legalName: true, dbaName: true, state: true, naicsDescription: true } } },
    orderBy: { sentAt: "desc" },
  });

  return NextResponse.json({ contacts });
}

// POST — create a new outreach contact
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    companyId?: string;
    ein?: string;
    roleTitleRef?: string;
    status?: string;
  };

  if (!body.companyId && !body.ein) {
    return NextResponse.json({ error: "companyId or ein required" }, { status: 400 });
  }

  const status = (body.status as "SAVED" | "REACHED_OUT" | "RESPONDED" | "IN_CONVERSATION") ?? "REACHED_OUT";

  // Upsert — if they already have a contact for this target, update it
  const where = body.companyId
    ? { userId_companyId: { userId: session.user.id, companyId: body.companyId } }
    : { userId_ein: { userId: session.user.id, ein: body.ein! } };

  const contact = await prisma.outreachContact.upsert({
    where,
    create: {
      userId: session.user.id,
      companyId: body.companyId ?? null,
      ein: body.ein ?? null,
      roleTitleRef: body.roleTitleRef ?? null,
      status,
      sentAt: new Date(),
    },
    update: {
      status,
      roleTitleRef: body.roleTitleRef ?? undefined,
      sentAt: status === "REACHED_OUT" ? new Date() : undefined,
    },
  });

  return NextResponse.json({ contact });
}
