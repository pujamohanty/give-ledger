import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/ngo/profile — fetch current NGO's profile data
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ngo = await prisma.ngo.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      orgName: true,
      description: true,
      website: true,
      ein: true,
      state: true,
      logoUrl: true,
      aiSummary: true,
      boardMembers: {
        orderBy: { orderIndex: "asc" },
        select: { id: true, name: true, role: true, memberType: true, bio: true, linkedinUrl: true, photoUrl: true, orderIndex: true },
      },
      documents: {
        select: { id: true, fileName: true, category: true, mimeType: true, fileSize: true, caption: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });
  return NextResponse.json(ngo);
}

// PATCH /api/ngo/profile — update NGO public profile fields
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });

  const body = await req.json();
  const { orgName, description, website } = body as {
    orgName?: string;
    description?: string;
    website?: string;
  };

  const updated = await prisma.ngo.update({
    where: { id: ngo.id },
    data: {
      ...(orgName !== undefined && { orgName }),
      ...(description !== undefined && { description }),
      ...(website !== undefined && { website }),
    },
    select: { id: true, orgName: true, description: true, website: true },
  });

  return NextResponse.json(updated);
}
