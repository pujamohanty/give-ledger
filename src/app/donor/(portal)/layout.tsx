import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AssistantPortal from "@/components/AssistantPortal";
import SidebarNavItem from "@/components/SidebarNavItem";
import SignOutButton from "@/components/SignOutButton";
import {
  Leaf, LayoutDashboard, Heart, TrendingUp, Settings,
  Search, Bell, Share2, Gift, Star, Globe, Briefcase, Award, Linkedin, UserCircle, ClipboardList,
} from "lucide-react";

const navItems = [
  { href: "/donor/dashboard",       label: "Dashboard",           icon: LayoutDashboard },
  { href: "/donor/profile",         label: "My Profile",           icon: UserCircle },
  { href: "/donor/donations",       label: "My Donations",         icon: Heart },
  { href: "/donor/impact",          label: "My Impact",            icon: TrendingUp },
  { href: "/donor/opportunities",   label: "My Opportunities",     icon: ClipboardList },
  { href: "/donor/skills",          label: "Skill Contributions",  icon: Briefcase },
  { href: "/donor/standing",        label: "NGO Standing",         icon: Award },
  { href: "/donor/post-builder",    label: "Post Builder",         icon: Linkedin },
  { href: "/donor/credential",      label: "My Credential",        icon: Award },
  { href: "/projects",              label: "Browse Projects",      icon: Search },
  { href: "/opportunities",         label: "Browse Opportunities", icon: ClipboardList },
  { href: "/campaigns",             label: "Campaigns",            icon: Gift },
  { href: "/donor/notifications",   label: "Notifications",        icon: Bell },
  { href: "/donor/referral",        label: "Invite Friends",       icon: Share2 },
  { href: "/impact",                label: "Platform Impact",      icon: Globe },
  { href: "/donor/settings",        label: "Settings",             icon: Settings },
];

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "NGO") redirect("/ngo/dashboard");
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");

  const userName = session.user.name ?? "Donor";
  const initials = userName.trim().split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();

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
          <p className="text-xs text-gray-400 mt-0.5 ml-9">Donor Portal</p>
        </div>

        {/* User card */}
        <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <span className="inline-block text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full leading-tight">
                Donor
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
        <div className="px-3 py-3 border-t border-[rgba(0,0,0,0.06)] space-y-0.5">
          <SidebarNavItem href="/suggest-ngo" label="Suggest an NGO" icon={Star} />
          <SignOutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-60 min-h-screen">
        {children}
      </main>
      <AssistantPortal role="donor" />
    </div>
  );
}
