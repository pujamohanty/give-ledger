import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DonorSidebarNav from "@/components/DonorSidebarNav";
import Navbar from "@/components/Navbar";

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await auth();
  } catch (err) {
    // Re-throw Next.js redirect errors so they propagate correctly.
    // Next.js redirect() works by throwing a special error with a digest
    // starting with "NEXT_REDIRECT". If we swallow it here, the redirect
    // never happens and the user gets signed out instead.
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: string }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    // Any other error (e.g. JWEInvalid from a stale/malformed JWT cookie)
    // clears all auth cookies and sends the user back to login with a clean slate.
    redirect("/api/auth/signout?callbackUrl=/login");
  }
  if (!session) redirect("/login");
  if (session.user.role === "NGO") redirect("/ngo/dashboard");
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");

  const userName = session.user.name ?? "Donor";
  const initials = userName.trim().split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { plan: true },
  });
  const isPro = subscription?.plan === "PRO";

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex">
      <DonorSidebarNav userName={userName} initials={initials} />
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <Navbar session={session} isPro={isPro} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
