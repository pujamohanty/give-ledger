import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NgoSidebarNav from "@/components/NgoSidebarNav";
import Navbar from "@/components/Navbar";
import { Clock, XCircle } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

export default async function NgoLayout({ children }: { children: React.ReactNode }) {
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
  if (session.user.role === "DONOR") redirect("/donor/dashboard");
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");

  let ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) {
    ngo = await prisma.ngo.create({
      data: {
        userId: session.user.id,
        orgName: session.user.name ?? "New Organisation",
        status: "PENDING",
      },
    });
  }

  const orgName = ngo.orgName;
  const initials = orgName.trim().split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();

  /* Pending gate */
  if (ngo.status === "PENDING") {
    return (
      <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.07)] p-8 text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Application Under Review</h1>
          <p className="text-sm text-gray-500 mb-2">
            Your NGO account is being reviewed by the GiveLedger team.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            We verify all NGOs before granting portal access. This typically takes 24-48 hours.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-left text-sm text-amber-800 mb-6">
            <p className="font-semibold mb-2 text-xs uppercase tracking-wide">What happens next</p>
            <ol className="space-y-1 list-decimal list-inside text-xs">
              <li>Our team reviews your registration details</li>
              <li>We may request additional documents via email</li>
              <li>Once approved, you can create projects and submit milestones</li>
            </ol>
          </div>
          <SignOutButton />
        </div>
      </div>
    );
  }

  /* Rejected gate */
  if (ngo.status === "REJECTED") {
    return (
      <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.07)] p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Application Not Approved</h1>
          <p className="text-sm text-gray-500 mb-3">
            Unfortunately your NGO application was not approved at this time.
          </p>
          {ngo.rejectReason && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-left text-sm text-red-700 mb-4">
              <p className="font-semibold mb-1 text-xs uppercase tracking-wide">Reason provided</p>
              <p className="text-xs">{ngo.rejectReason}</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mb-6">
            If you believe this is an error, please contact us at support@giveledger.com.
          </p>
          <SignOutButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex">
      <NgoSidebarNav orgName={orgName} initials={initials} />
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <Navbar session={session} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
