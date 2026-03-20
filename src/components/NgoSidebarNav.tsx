"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Leaf, LayoutDashboard, FolderOpen, DollarSign, Settings,
  FileText, Upload, Briefcase, Award, Linkedin, Building2,
  ClipboardList, Users, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SignOutButton from "@/components/SignOutButton";

type NavItem  = { href: string; label: string; icon: React.ElementType };
type NavGroup = {
  label: string;
  items: NavItem[];
  accent: { border: string; label: string; dot: string };
};

const navGroups: NavGroup[] = [
  {
    label: "Projects & Funding",
    accent: { border: "border-emerald-400", label: "text-emerald-600", dot: "bg-emerald-400" },
    items: [
      { href: "/ngo/projects",         label: "My Projects",         icon: FolderOpen    },
      { href: "/ngo/submit-milestone", label: "Submit Evidence",     icon: Upload        },
      { href: "/ngo/finances",         label: "Finances",            icon: DollarSign    },
      { href: "/ngo/reports",          label: "Reports",             icon: FileText      },
    ],
  },
  {
    label: "Talent",
    accent: { border: "border-violet-400", label: "text-violet-600", dot: "bg-violet-400" },
    items: [
      { href: "/ngo/roles",            label: "Open Roles",          icon: ClipboardList },
      { href: "/ngo/skills",           label: "Skill Contributions", icon: Briefcase     },
      { href: "/ngo/contributors",     label: "Our Contributors",    icon: Users         },
    ],
  },
  {
    label: "Community",
    accent: { border: "border-amber-400", label: "text-amber-600", dot: "bg-amber-400" },
    items: [
      { href: "/ngo/recognition",      label: "Donor Recognition",   icon: Award         },
      { href: "/ngo/post-builder",     label: "Post Builder",        icon: Linkedin      },
    ],
  },
  {
    label: "Organisation",
    accent: { border: "border-slate-400", label: "text-slate-500", dot: "bg-slate-400" },
    items: [
      { href: "/ngo/org-profile",      label: "NGO Profile",         icon: Building2     },
      { href: "/ngo/settings",         label: "Settings",            icon: Settings      },
    ],
  },
];

function NavLink({ href, label, icon: Icon }: NavItem) {
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
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />}
    </Link>
  );
}

function CollapsibleGroup({ label, items, accent }: NavGroup) {
  const pathname = usePathname();
  const hasActive = items.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );
  const [open, setOpen] = useState(hasActive || label === "Projects & Funding");

  return (
    <div className={cn("border-l-2 pl-1.5 ml-0.5", accent.border)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-gray-50",
          accent.label
        )}
      >
        <span className="flex items-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", accent.dot)} />
          {label}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200 text-gray-400",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>

      {open && (
        <div className="mt-0.5 space-y-0.5">
          {items.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  orgName: string;
  initials: string;
}

export default function NgoSidebarNav({ orgName, initials }: Props) {
  const pathname = usePathname();
  const dashActive = pathname === "/ngo/dashboard";

  return (
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
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {/* Dashboard — always visible, not in a group */}
        <Link
          href="/ngo/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
            dashActive
              ? "bg-emerald-50 text-emerald-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <LayoutDashboard
            className={cn(
              "w-4 h-4 shrink-0 transition-colors",
              dashActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"
            )}
          />
          <span className="truncate">Dashboard</span>
          {dashActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />}
        </Link>

        <div className="pt-1 space-y-1">
          {navGroups.map((group) => (
            <CollapsibleGroup key={group.label} {...group} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[rgba(0,0,0,0.06)]">
        <SignOutButton />
      </div>
    </aside>
  );
}
