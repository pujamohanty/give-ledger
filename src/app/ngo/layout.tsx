import Link from "next/link";
import { Leaf, LayoutDashboard, FolderOpen, DollarSign, Settings, LogOut, FileText } from "lucide-react";

const navItems = [
  { href: "/ngo/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ngo/projects", label: "My Projects", icon: FolderOpen },
  { href: "/ngo/finances", label: "Finances", icon: DollarSign },
  { href: "/ngo/reports", label: "Reports", icon: FileText },
  { href: "/ngo/settings", label: "Settings", icon: Settings },
];

export default function NgoLayout({ children }: { children: React.ReactNode }) {
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
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
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
