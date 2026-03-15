"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function SidebarNavItem({ href, label, icon: Icon }: Props) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 shrink-0 transition-colors",
          active ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"
        )}
      />
      <span className="truncate">{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
      )}
    </Link>
  );
}
