import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "DONOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await prisma.donorApplicationProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DONOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, bio, isDefault } = body;

  if (!title?.trim() || !bio?.trim()) {
    return NextResponse.json({ error: "Title and bio are required" }, { status: 400 });
  }

  // If setting as default, clear other defaults first
  if (isDefault) {
    await prisma.donorApplicationProfile.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const profile = await prisma.donorApplicationProfile.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      bio: bio.trim(),
      isDefault: isDefault ?? false,
    },
  });

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DONOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, title, bio, isDefault } = body;

  if (!id) return NextResponse.json({ error: "Profile ID required" }, { status: 400 });

  // Verify ownership
  const existing = await prisma.donorApplicationProfile.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (isDefault) {
    await prisma.donorApplicationProfile.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.donorApplicationProfile.update({
    where: { id },
    data: {
      ...(title ? { title: title.trim() } : {}),
      ...(bio ? { bio: bio.trim() } : {}),
      ...(typeof isDefault === "boolean" ? { isDefault } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DONOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Profile ID required" }, { status: 400 });

  const existing = await prisma.donorApplicationProfile.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.donorApplicationProfile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
