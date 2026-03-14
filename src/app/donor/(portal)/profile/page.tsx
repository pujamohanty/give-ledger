import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export default async function DonorProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, bio: true, jobTitle: true,
      company: true, city: true, linkedinUrl: true,
      twitterUrl: true, portfolioUrl: true, skills: true, image: true,
      documents: {
        select: { id: true, fileName: true, category: true, mimeType: true, fileSize: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/login");

  const initial = {
    ...user,
    documents: user.documents.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
    })),
  };

  return <ProfileClient initial={initial} />;
}
