import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NgosClient from "./NgosClient";

export default async function AdminNgosPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/login");

  const ngos = await prisma.ngo.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const applications = ngos.map((ngo) => ({
    id: ngo.id,
    name: ngo.orgName,
    regNumber: ngo.regNumber,
    country: ngo.country,
    contactName: ngo.user.name,
    email: ngo.user.email,
    website: ngo.website,
    status: ngo.status,
    description: ngo.description,
    submittedAt: ngo.createdAt,
  }));

  return <NgosClient initialApplications={applications} />;
}
