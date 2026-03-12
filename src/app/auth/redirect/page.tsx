import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AuthRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { role: intendedRole } = await searchParams;

  // If the user just signed up as NGO and their role is still the default DONOR, upgrade it
  if (intendedRole === "NGO" && session.user.role === "DONOR") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "NGO" },
    });
    redirect("/ngo/dashboard");
  }

  if (session.user.role === "NGO") redirect("/ngo/dashboard");
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");
  redirect("/donor/dashboard");
}
