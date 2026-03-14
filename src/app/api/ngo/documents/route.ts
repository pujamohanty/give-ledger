import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });

  const docs = await prisma.ngoDocument.findMany({
    where: { ngoId: ngo.id },
    select: { id: true, fileName: true, category: true, mimeType: true, fileSize: true, caption: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });

  const { fileName, category, mimeType, fileSize, fileData, caption } = await req.json();

  if (!fileName || !mimeType || !fileData) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (fileSize > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
  }

  const doc = await prisma.ngoDocument.create({
    data: { ngoId: ngo.id, fileName, category: category ?? "OTHER", mimeType, fileSize, fileData, caption },
    select: { id: true, fileName: true, category: true, mimeType: true, fileSize: true, caption: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, document: doc });
}
