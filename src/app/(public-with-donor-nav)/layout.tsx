import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DonorSidebarNav from "@/components/DonorSidebarNav";
import NgoSidebarNav from "@/components/NgoSidebarNav";

function initials(name: string) {
  return name.trim().split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default async function PublicWithDonorNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Silently ignore auth errors (e.g. stale JWT) — public pages should always render
  let session = null;
  try {
    session = await auth();
  } catch {
    // not logged in or invalid token — treat as guest
  }

  const role = session?.user?.role;

  if (role === "DONOR") {
    const userName = session!.user.name ?? "Donor";
    return (
      <div className="min-h-screen bg-[#f3f2ef] flex">
        <DonorSidebarNav userName={userName} initials={initials(userName)} />
        <main className="flex-1 lg:ml-60 min-h-screen">{children}</main>
      </div>
    );
  }

  if (role === "NGO") {
    const ngo = await prisma.ngo.findUnique({
      where: { userId: session!.user.id },
      select: { orgName: true },
    });
    const orgName = ngo?.orgName ?? session!.user.name ?? "NGO";
    return (
      <div className="min-h-screen bg-[#f3f2ef] flex">
        <NgoSidebarNav orgName={orgName} initials={initials(orgName)} />
        <main className="flex-1 lg:ml-60 min-h-screen">{children}</main>
      </div>
    );
  }

  // Guest or admin — render page normally with no sidebar
  return <>{children}</>;
}
