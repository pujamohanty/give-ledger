import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/ngo/board/[id] — remove a board member
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo || ngo.status !== "ACTIVE") {
    return NextResponse.json({ error: "NGO not found or not active" }, { status: 403 });
  }

  // Verify this member belongs to this NGO
  const member = await prisma.boardMember.findUnique({ where: { id } });
  if (!member || member.ngoId !== ngo.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.boardMember.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

// PUT /api/ngo/board/[id] — update a board member
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo || ngo.status !== "ACTIVE") {
    return NextResponse.json({ error: "NGO not found or not active" }, { status: 403 });
  }

  const member = await prisma.boardMember.findUnique({ where: { id } });
  if (!member || member.ngoId !== ngo.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const updated = await prisma.boardMember.update({
    where: { id },
    data: {
      name: name.trim(),
      role: role.trim(),
      bio: bio?.trim() || null,
      linkedinUrl: linkedinUrl?.trim() || null,
      photoUrl: photoUrl?.trim() || null,
    },
  });

  return NextResponse.json({ member: updated });
}
