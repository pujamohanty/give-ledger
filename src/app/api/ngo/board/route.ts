import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/ngo/board — add a board member
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo || ngo.status !== "ACTIVE") {
    return NextResponse.json({ error: "NGO not found or not active" }, { status: 403 });
  }

  const body = await req.json();
  const { name, role, bio, linkedinUrl, photoUrl } = body as {
    name: string;
    role: string;
    bio?: string;
    linkedinUrl?: string;
    photoUrl?: string;
  };

  if (!name?.trim() || !role?.trim()) {
    return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
  }

  // Assign next orderIndex
  const existing = await prisma.boardMember.count({ where: { ngoId: ngo.id } });

  const member = await prisma.boardMember.create({
    data: {
      ngoId: ngo.id,
      name: name.trim(),
      role: role.trim(),
      bio: bio?.trim() || null,
      linkedinUrl: linkedinUrl?.trim() || null,
      photoUrl: photoUrl?.trim() || null,
      orderIndex: existing,
    },
  });

  return NextResponse.json({ member });
}
