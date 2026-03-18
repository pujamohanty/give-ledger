import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AssistantPortal from "@/components/AssistantPortal";
import DonorSidebarNav from "@/components/DonorSidebarNav";

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await auth();
  } catch (err) {
    // Re-throw Next.js redirect errors — they must propagate, not be swallowed
    if (err && typeof err === "object" && "digest" in err &&
        typeof (err as { digest: string }).digest === "string" &&
        (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    redirect("/api/auth/signout?callbackUrl=/login");
  }
  if (!session) redirect("/login");
  if (session.user.role === "NGO") redirect("/ngo/dashboard");
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");

  const userName = session.user.name ?? "Donor";
  const initials = userName.trim().split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex">
      <DonorSidebarNav userName={userName} initials={initials} />
      <main className="flex-1 lg:ml-60 min-h-screen">
        {children}
      </main>
      <AssistantPortal role="donor" />
    </div>
  );
}
