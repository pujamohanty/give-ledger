import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrgProfileClient from "./OrgProfileClient";

export default async function OrgProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ngo = await prisma.ngo.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      orgName: true,
      description: true,
      website: true,
      aiSummary: true,
      boardMembers: {
        orderBy: { orderIndex: "asc" },
        select: { id: true, name: true, role: true, memberType: true, bio: true, linkedinUrl: true, photoUrl: true },
      },
      documents: {
        select: { id: true, fileName: true, category: true, mimeType: true, fileSize: true, caption: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ngo) redirect("/login");

  const initial = {
    ...ngo,
    documents: ngo.documents.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
    })),
  };

  return <OrgProfileClient initial={initial} />;
}
