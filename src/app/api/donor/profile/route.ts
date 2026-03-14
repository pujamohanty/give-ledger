import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, bio: true, jobTitle: true,
      company: true, city: true, linkedinUrl: true,
      twitterUrl: true, portfolioUrl: true, skills: true, image: true,
    },
  });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, bio, jobTitle, company, city, linkedinUrl, twitterUrl, portfolioUrl, skills } =
    await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name: name?.trim() || null }),
      ...(bio !== undefined && { bio: bio?.trim() || null }),
      ...(jobTitle !== undefined && { jobTitle: jobTitle?.trim() || null }),
      ...(company !== undefined && { company: company?.trim() || null }),
      ...(city !== undefined && { city: city?.trim() || null }),
      ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl?.trim() || null }),
      ...(twitterUrl !== undefined && { twitterUrl: twitterUrl?.trim() || null }),
      ...(portfolioUrl !== undefined && { portfolioUrl: portfolioUrl?.trim() || null }),
      ...(skills !== undefined && { skills: skills || null }),
    },
    select: {
      id: true, name: true, bio: true, jobTitle: true,
      company: true, city: true, linkedinUrl: true,
      twitterUrl: true, portfolioUrl: true, skills: true,
    },
  });

  return NextResponse.json({ ok: true, user });
}
