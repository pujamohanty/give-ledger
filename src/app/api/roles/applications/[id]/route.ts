import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH: accept or reject an application
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "NGO") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: applicationId } = await params;
  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });

  const application = await prisma.roleApplication.findUnique({
    where: { id: applicationId },
    include: { role: true },
  });
  if (!application || application.role.ngoId !== ngo.id) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }
  if (application.status !== "PENDING") {
    return NextResponse.json({ error: "Application already reviewed" }, { status: 409 });
  }

  const body = await req.json();
  const { action } = body; // "accept" | "reject"

  if (action === "accept") {
    const [updated] = await prisma.$transaction([
      prisma.roleApplication.update({
        where: { id: applicationId },
        data: { status: "ACCEPTED", reviewedAt: new Date() },
      }),
      prisma.roleEngagement.create({
        data: { applicationId, status: "ACTIVE" },
      }),
    ]);

    // Notify the applicant
    await prisma.notification.create({
      data: {
        userId: application.applicantId,
        type: "ROLE_ACCEPTED",
        title: "Application accepted!",
        message: `${ngo.orgName} accepted your application for "${application.role.title}"`,
        linkUrl: `/donor/opportunities`,
      },
    }).catch(() => {});

    return NextResponse.json(updated);
  }

  if (action === "reject") {
    const updated = await prisma.roleApplication.update({
      where: { id: applicationId },
      data: { status: "REJECTED", reviewedAt: new Date() },
    });

    await prisma.notification.create({
      data: {
        userId: application.applicantId,
        type: "ROLE_REJECTED",
        title: "Application update",
        message: `Your application for "${application.role.title}" at ${ngo.orgName} was not accepted this time.`,
        linkUrl: `/opportunities`,
      },
    }).catch(() => {});

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
