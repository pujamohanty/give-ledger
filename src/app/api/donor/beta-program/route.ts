import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requirePro(userId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true },
  });
  return sub?.plan === "PRO";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.betaTesterProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isPro = await requirePro(session.user.id);
  if (!isPro) {
    return NextResponse.json(
      { error: "The Beta Tester & UGC Creator Program is a PRO plan benefit. Upgrade to Pro to join." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const {
    devices, followerRange, niches,
    instagramHandle, tiktokHandle, twitterHandle,
    youtubeHandle, linkedinHandle, redditHandle,
  } = body;

  if (!devices?.length)  return NextResponse.json({ error: "Please select at least one device." }, { status: 400 });
  if (!followerRange)    return NextResponse.json({ error: "Please select your follower range." }, { status: 400 });
  if (!niches?.length)   return NextResponse.json({ error: "Please select at least one content niche." }, { status: 400 });

  // Require at least 3 social handles
  const handles = [instagramHandle, tiktokHandle, twitterHandle, youtubeHandle, linkedinHandle, redditHandle];
  const filledCount = handles.filter((h) => h && h.trim().length > 0).length;
  if (filledCount < 3) {
    return NextResponse.json(
      { error: "Please provide at least 3 social media handles so brands can find you." },
      { status: 400 }
    );
  }

  const clean = (h: string | undefined) => (h ? h.replace(/^@/, "").trim() || null : null);

  const profile = await prisma.betaTesterProfile.upsert({
    where:  { userId: session.user.id },
    create: {
      userId:          session.user.id,
      interests:       ["BETA_TESTING", "UGC_CONTENT"],
      devices,
      followerRange,
      niches,
      instagramHandle: clean(instagramHandle),
      tiktokHandle:    clean(tiktokHandle),
      twitterHandle:   clean(twitterHandle),
      youtubeHandle:   clean(youtubeHandle),
      linkedinHandle:  clean(linkedinHandle),
      redditHandle:    clean(redditHandle),
    },
    update: {
      devices,
      followerRange,
      niches,
      instagramHandle: clean(instagramHandle),
      tiktokHandle:    clean(tiktokHandle),
      twitterHandle:   clean(twitterHandle),
      youtubeHandle:   clean(youtubeHandle),
      linkedinHandle:  clean(linkedinHandle),
      redditHandle:    clean(redditHandle),
      isActive: true,
    },
  });

  return NextResponse.json({ profile });
}
