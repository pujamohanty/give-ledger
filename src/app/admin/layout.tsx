import Link from "next/link";
import {
  Leaf,
  LayoutDashboard,
  Building2,
  DollarSign,
  Activity,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/ngos", label: "NGO Applications", icon: Building2 },
  { href: "/admin/disbursements", label: "Disbursements", icon: DollarSign },
  { href: "/admin/transactions", label: "Transactions", icon: Activity },
  { href: "/admin/settings", label: "Platform Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex w-64 flex-col bg-gray-900 text-white fixed h-full">
        <div className="p-6 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-400 text-lg">
            <Leaf className="w-5 h-5" />
            GiveLedger
          </Link>
          <div className="flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <p className="text-xs text-amber-400 font-medium">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>
      <main className="flex-1 lg:ml-64 min-h-screen">{children}</main>
    </div>
  );
}
