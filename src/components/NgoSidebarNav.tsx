"use client";
import Link from "next/link";
import {
  Leaf, LayoutDashboard, FolderOpen, DollarSign, Settings,
  FileText, Upload, Briefcase, Award, Linkedin, Building2, ClipboardList, Users,
} from "lucide-react";
import SidebarNavItem from "@/components/SidebarNavItem";
import SignOutButton from "@/components/SignOutButton";

const navItems = [
  { href: "/ngo/dashboard",        label: "Dashboard",           icon: LayoutDashboard },
  { href: "/ngo/org-profile",      label: "NGO Profile",         icon: Building2       },
  { href: "/ngo/projects",         label: "My Projects",         icon: FolderOpen      },
  { href: "/ngo/roles",            label: "Open Roles",          icon: ClipboardList   },
  { href: "/ngo/submit-milestone", label: "Submit Evidence",     icon: Upload          },
  { href: "/ngo/contributors",     label: "Our Contributors",    icon: Users           },
  { href: "/ngo/skills",           label: "Skill Contributions", icon: Briefcase       },
  { href: "/ngo/recognition",      label: "Donor Recognition",   icon: Award           },
  { href: "/ngo/post-builder",     label: "Post Builder",        icon: Linkedin        },
  { href: "/ngo/finances",         label: "Finances",            icon: DollarSign      },
  { href: "/ngo/reports",          label: "Reports",             icon: FileText        },
  { href: "/ngo/settings",         label: "Settings",            icon: Settings        },
];

interface Props {
  orgName: string;
  initials: string;
}

export default function NgoSidebarNav({ orgName, initials }: Props) {
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
  );
}
