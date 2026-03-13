import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  Leaf, LayoutDashboard, Heart, TrendingUp, Settings,
  Search, Bell, Share2, Gift, Star, Globe,
} from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

const navItems = [
  { href: "/donor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/donor/donations", label: "My Donations", icon: Heart },
  { href: "/donor/impact", label: "My Impact", icon: TrendingUp },
  { href: "/projects", label: "Browse Projects", icon: Search },
  { href: "/campaigns", label: "Campaigns", icon: Gift },
  { href: "/donor/notifications", label: "Notifications", icon: Bell },
  { href: "/donor/referral", label: "Invite Friends", icon: Share2 },
  { href: "/impact", label: "Platform Impact", icon: Globe },
  { href: "/donor/settings", label: "Settings", icon: Settings },
];

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "NGO") redirect("/ngo/dashboard");
  if (session.user.role === "ADMIN") redirect("/admin/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-100 fixed h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700 text-lg">
            <Leaf className="w-5 h-5" />
            GiveLedger
          </Link>
          <p className="text-xs text-gray-400 mt-1">Donor Portal</p>
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
        <div className="p-4 border-t border-gray-100 space-y-1">
          <Link
            href="/suggest-ngo"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
          >
            <Star className="w-4 h-4" />
            Suggest an NGO
          </Link>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 lg:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
