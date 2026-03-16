import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to apply" }, { status: 401 });
  }
  if (session.user.role !== "DONOR") {
    return NextResponse.json({ error: "Only donors can apply to roles" }, { status: 403 });
  }

  const { id: roleId } = await params;

  const role = await prisma.ngoRole.findUnique({ where: { id: roleId } });
  if (!role || role.status !== "OPEN") {
    return NextResponse.json({ error: "Role not found or no longer open" }, { status: 404 });
  }

  // Check for existing application
  const existing = await prisma.roleApplication.findUnique({
    where: { roleId_applicantId: { roleId, applicantId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already applied to this role" }, { status: 409 });
  }

  const body = await req.json();
  const { coverNote, linkedinUrl, portfolioUrl } = body;

  if (!coverNote?.trim()) {
    return NextResponse.json({ error: "Cover note is required" }, { status: 400 });
  }

  const application = await prisma.roleApplication.create({
    data: {
      roleId,
      applicantId: session.user.id,
      coverNote,
      linkedinUrl: linkedinUrl || null,
      portfolioUrl: portfolioUrl || null,
      status: "PENDING",
    },
  });

  // Notify NGO
  const ngo = await prisma.ngo.findUnique({ where: { id: role.ngoId } });
  if (ngo) {
    await prisma.notification.create({
      data: {
        userId: ngo.userId,
        type: "ROLE_APPLICATION",
        title: "New application received",
        message: `${session.user.name ?? "Someone"} applied for "${role.title}"`,
        linkUrl: `/ngo/roles/${roleId}`,
      },
    }).catch(() => {});
  }

  return NextResponse.json({ id: application.id });
}
