import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = await prisma.donorDocument.findMany({
    where: { userId: session.user.id },
    select: { id: true, fileName: true, category: true, mimeType: true, fileSize: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName, category, mimeType, fileSize, fileData } = await req.json();

  if (!fileName || !mimeType || !fileData) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (fileSize > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
  }

  const doc = await prisma.donorDocument.create({
    data: {
      userId: session.user.id,
      fileName,
      category: category ?? "OTHER",
      mimeType,
      fileSize,
      fileData,
    },
    select: { id: true, fileName: true, category: true, mimeType: true, fileSize: true, createdAt: true },
  });

  return NextResponse.json({ ok: true, document: doc });
}
