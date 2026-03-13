import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/notifications/mark-read
// Body: { id?: string } — if no id, marks all as read for the current user
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await req.json().catch(() => ({}));
  const { id } = body as { id?: string };

  if (id) {
    // Mark single notification — verify it belongs to this user
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  } else {
    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId },
      data: { read: true },
    });
  }

  return NextResponse.json({ ok: true });
}
