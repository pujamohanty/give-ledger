import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      suggestedRoles: {
        where: { expiresAt: { gt: new Date() } },
        orderBy: [{ isAiAugmented: "asc" }, { generatedAt: "desc" }],
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json({ company });
}
