"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Leaf, LayoutDashboard, Heart, TrendingUp, Settings,
  Search, Bell, Share2, Gift, Star, Globe, Briefcase,
  Award, Linkedin, UserCircle, ClipboardList, Crown,
  GraduationCap, ChevronDown, Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SignOutButton from "@/components/SignOutButton";

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "My Activity",
    items: [
      { href: "/donor/donations",     label: "My Donations",        icon: Heart         },
      { href: "/donor/impact",        label: "My Impact",           icon: TrendingUp    },
      { href: "/donor/opportunities", label: "My Roles",            icon: ClipboardList },
      { href: "/donor/skills",        label: "Skill Contributions", icon: Briefcase     },
    ],
  },
  {
    label: "My Profile",
    items: [
      { href: "/donor/profile",        label: "Profile",             icon: UserCircle    },
      { href: "/donor/credential",     label: "My Credential",       icon: Award         },
      { href: "/donor/standing",       label: "NGO Standing",        icon: Star          },
      { href: "/donor/post-builder",   label: "Post Builder",        icon: Linkedin      },
      { href: "/donor/beta-program",   label: "Beta Program",        icon: Smartphone    },
    ],
  },
  {
    label: "Discover",
    items: [
      { href: "/projects",            label: "Browse Projects",     icon: Search        },
      { href: "/opportunities",       label: "Browse Roles",        icon: ClipboardList },
      { href: "/campaigns",           label: "Campaigns",           icon: Gift          },
      { href: "/impact",              label: "Platform Impact",     icon: Globe         },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/donor/training",      label: "AI Training",         icon: GraduationCap },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/donor/subscription",  label: "My Plan",             icon: Crown         },
      { href: "/donor/notifications", label: "Notifications",       icon: Bell          },
      { href: "/donor/referral",      label: "Invite Friends",      icon: Share2        },
      { href: "/donor/settings",      label: "Settings",            icon: Settings      },
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

function CollapsibleGroup({ label, items }: NavGroup) {
  const pathname = usePathname();
  const hasActive = items.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );
  // Auto-open if current page is in this group; "My Activity" open by default
  const [open, setOpen] = useState(hasActive || label === "My Activity");

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
      >
        {label}
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
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
  userName: string;
  initials: string;
}

export default function DonorSidebarNav({ userName, initials }: Props) {
  const pathname = usePathname();
  const dashActive = pathname === "/donor/dashboard";

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
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {/* Dashboard — always visible, not in a group */}
        <Link
          href="/donor/dashboard"
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
      <div className="px-3 py-3 border-t border-[rgba(0,0,0,0.06)] space-y-0.5">
        <NavLink href="/suggest-ngo" label="Suggest an NGO" icon={Star} />
        <SignOutButton />
      </div>
    </aside>
  );
}
