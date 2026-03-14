import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await prisma.ngoDocument.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const buffer = Buffer.from(doc.fileData, "base64");
  return new Response(buffer, {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${doc.fileName}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.ngoDocument.findUnique({ where: { id } });
  if (!doc || doc.ngoId !== ngo.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.ngoDocument.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
