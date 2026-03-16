import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AssistantPortal from "@/components/AssistantPortal";
import SidebarNavItem from "@/components/SidebarNavItem";
import SignOutButton from "@/components/SignOutButton";
import {
  Leaf, LayoutDashboard, FolderOpen, DollarSign, Settings,
  FileText, Upload, Clock, XCircle, Briefcase, Award, Linkedin, Building2, ClipboardList,
} from "lucide-react";

const navItems = [
  { href: "/ngo/dashboard",       label: "Dashboard",           icon: LayoutDashboard },
  { href: "/ngo/org-profile",     label: "NGO Profile",         icon: Building2 },
  { href: "/ngo/projects",        label: "My Projects",         icon: FolderOpen },
  { href: "/ngo/roles",           label: "Open Roles",          icon: ClipboardList },
  { href: "/ngo/submit-milestone", label: "Submit Evidence",    icon: Upload },
  { href: "/ngo/skills",          label: "Skill Contributions", icon: Briefcase },
  { href: "/ngo/recognition",     label: "Donor Recognition",   icon: Award },
  { href: "/ngo/post-builder",    label: "Post Builder",        icon: Linkedin },
  { href: "/ngo/finances",        label: "Finances",            icon: DollarSign },
  { href: "/ngo/reports",         label: "Reports",             icon: FileText },
  { href: "/ngo/settings",        label: "Settings",            icon: Settings },
];

export default async function NgoLayout({ children }: { children: React.ReactNode }) {
  // Wrap auth() in try-catch: a stale/malformed JWT cookie throws JWEInvalid.
  // Redirect to NextAuth's signout endpoint which clears all auth cookies,
  // then sends the user back to /login with a clean slate.
  let session;
  try {
    session = await auth();
  } catch {
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

  /* ── Pending gate ── */
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
            We verify all NGOs before granting portal access. This typically takes 24–48 hours.
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

  /* ── Rejected gate ── */
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
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-white border-r border-[rgba(0,0,0,0.08)] fixed h-full overflow-y-auto z-30">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700 text-sm">
            <div className="w-7 h-7 bg-emerald-700 rounded-md flex items-center justify-center shrink-0">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            GiveLedger
          </Link>
          <p className="text-xs text-gray-400 mt-0.5 ml-9">NGO Portal</p>
        </div>

        {/* Org card */}
        <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{orgName}</p>
              <span className="inline-block text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full leading-tight">
                NGO
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarNavItem key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 lg:ml-60 min-h-screen">{children}</main>
      <AssistantPortal role="ngo" />
    </div>
  );
}
