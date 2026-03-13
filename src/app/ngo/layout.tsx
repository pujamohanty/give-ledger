import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Leaf, LayoutDashboard, FolderOpen, DollarSign, Settings, FileText, Upload, Clock, XCircle, Briefcase } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

const navItems = [
  { href: "/ngo/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ngo/projects", label: "My Projects", icon: FolderOpen },
  { href: "/ngo/submit-milestone", label: "Submit Evidence", icon: Upload },
  { href: "/ngo/skills", label: "Skill Contributions", icon: Briefcase },
  { href: "/ngo/finances", label: "Finances", icon: DollarSign },
  { href: "/ngo/reports", label: "Reports", icon: FileText },
  { href: "/ngo/settings", label: "Settings", icon: Settings },
];

export default async function NgoLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "DONOR") redirect("/donor/dashboard");
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");

  // Ensure Ngo record exists; create it on first portal access if missing
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

  // Approval gate — show holding screen instead of the portal
  if (ngo.status === "PENDING") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Under Review</h1>
          <p className="text-gray-500 mb-2">
            Your NGO account is being reviewed by the GiveLedger team.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            We verify all NGOs before granting access to the portal. This typically takes 24–48 hours.
            You will receive an email notification once your account is approved.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left text-sm text-amber-800 mb-6">
            <p className="font-semibold mb-2">What happens next:</p>
            <ol className="space-y-1 list-decimal list-inside">
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

  if (ngo.status === "REJECTED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Not Approved</h1>
          <p className="text-gray-500 mb-2">
            Unfortunately your NGO application was not approved at this time.
          </p>
          {ngo.rejectReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-left text-sm text-red-700 my-4">
              <p className="font-semibold mb-1">Reason provided:</p>
              <p>{ngo.rejectReason}</p>
            </div>
          )}
          <p className="text-sm text-gray-400 mb-6">
            If you believe this is an error, please contact us at support@giveledger.com.
          </p>
          <SignOutButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-100 fixed h-full">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700 text-lg">
            <Leaf className="w-5 h-5" />
            GiveLedger
          </Link>
          <p className="text-xs text-gray-400 mt-1">NGO Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 lg:ml-64 min-h-screen">{children}</main>
    </div>
  );
}
