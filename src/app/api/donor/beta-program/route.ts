import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const body = await req.json();
  const {
    interests, devices, followerRange, niches,
    instagramHandle, tiktokHandle, twitterHandle, youtubeHandle,
  } = body;

  if (!interests?.length || !devices?.length || !followerRange || !niches?.length) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  const profile = await prisma.betaTesterProfile.upsert({
    where:  { userId: session.user.id },
    create: {
      userId: session.user.id,
      interests,
      devices,
      followerRange,
      niches,
      instagramHandle: instagramHandle || null,
      tiktokHandle:    tiktokHandle    || null,
      twitterHandle:   twitterHandle   || null,
      youtubeHandle:   youtubeHandle   || null,
    },
    update: {
      interests,
      devices,
      followerRange,
      niches,
      instagramHandle: instagramHandle || null,
      tiktokHandle:    tiktokHandle    || null,
      twitterHandle:   twitterHandle   || null,
      youtubeHandle:   youtubeHandle   || null,
      isActive: true,
    },
  });

  return NextResponse.json({ profile });
}
