import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "NGO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });

  const role = await prisma.ngoRole.findFirst({
    where: { id, ngoId: ngo.id },
    include: {
      project: { select: { title: true } },
      applications: {
        include: {
          applicant: {
            select: { id: true, name: true, email: true, image: true, jobTitle: true, company: true, city: true, linkedinUrl: true },
          },
          engagement: true,
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });

  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  return NextResponse.json(role);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "NGO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });

  const role = await prisma.ngoRole.findFirst({ where: { id, ngoId: ngo.id } });
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.ngoRole.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.title && { title: body.title }),
    },
  });

  return NextResponse.json(updated);
}
