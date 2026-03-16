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

  // Always re-fetch the role from the DB — never trust the JWT alone.
  // Stale JWT cookies can carry an old role (e.g. DONOR) even after
  // the user has re-authenticated as a different account (e.g. NGO).
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const actualRole = dbUser?.role ?? session.user.role;

  // If the user just signed up as NGO and their role is still the default DONOR, upgrade it
  if (intendedRole === "NGO" && actualRole === "DONOR") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "NGO" },
    });
    redirect("/ngo/dashboard");
  }

  if (actualRole === "NGO") redirect("/ngo/dashboard");
  if (actualRole === "ADMIN") redirect("/admin/dashboard");
  redirect("/donor/dashboard");
}
