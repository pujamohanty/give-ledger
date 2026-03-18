import { auth } from "@/lib/auth";
import DonorSidebarNav from "@/components/DonorSidebarNav";

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

  const isDonor = session?.user?.role === "DONOR";

  if (isDonor) {
    const userName = session!.user.name ?? "Donor";
    const initials = userName
      .trim()
      .split(" ")
      .map((p: string) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div className="min-h-screen bg-[#f3f2ef] flex">
        <DonorSidebarNav userName={userName} initials={initials} />
        <main className="flex-1 lg:ml-60 min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  // Not a donor (guest, NGO, admin) — render normally with no sidebar
  return <>{children}</>;
}
