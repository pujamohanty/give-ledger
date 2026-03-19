"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Menu, X, Leaf, ChevronDown, Search, LayoutDashboard, LogOut } from "lucide-react";

interface NavbarProps {
  session?: { user: { name?: string | null; role: string } } | null;
  openRolesCount?: number;
}

function initials(name: string | null | undefined) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

const NAV_ITEMS = [
  {
    href: "/projects",
    label: "Projects",
    tip: "Browse verified NGO projects with milestone-locked funding",
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    tip: "Donor-led fundraising campaigns for causes you care about",
  },
  {
    href: "/opportunities",
    label: "Open Roles",
    tip: "Contribute your professional skills to NGOs — verified on your credential",
  },
  {
    href: "/pricing",
    label: "Pricing",
    tip: "Free to explore. Paid plans unlock role applications and priority listing",
  },
  {
    href: "/wall",
    label: "Activity",
    tip: "Live feed of donations, milestones, endorsements and skill contributions",
  },
  {
    href: "/impact",
    label: "Impact",
    tip: "Platform-wide verified impact — funds disbursed, milestones completed, NGOs reached",
  },
];

export default function Navbar({ session, openRolesCount }: NavbarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const portalHref = !session ? "/login"
    : session.user.role === "DONOR" ? "/donor/dashboard"
    : session.user.role === "NGO"   ? "/ngo/dashboard"
    : session.user.role === "ADMIN" ? "/admin/dashboard"
    : "/";

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-[rgba(0,0,0,0.12)]"
      style={{ height: "52px" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center gap-2">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 font-bold text-emerald-700 text-base shrink-0 mr-2"
          aria-label="GiveLedger home"
        >
          <div className="w-8 h-8 bg-emerald-700 rounded-md flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:block">GiveLedger</span>
        </Link>

        {/* Search bar — desktop */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-md px-3 h-8 gap-2 w-48 shrink-0">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            className="bg-transparent text-xs text-gray-700 placeholder:text-gray-400 outline-none w-full"
            placeholder="Search projects…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                router.push(`/projects?q=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery("");
              }
            }}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 hover:text-gray-900 text-xs font-medium rounded transition-colors"
              >
                <span className="relative">
                  {item.label}
                  {item.href === "/opportunities" && openRolesCount && openRolesCount > 0 ? (
                    <sup className="ml-0.5 text-[9px] font-bold text-emerald-600">{openRolesCount}</sup>
                  ) : null}
                </span>
              </Link>
              {/* Tooltip */}
              <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-gray-900 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                {item.tip}
                {/* Arrow */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 overflow-hidden">
                  <div className="w-2 h-2 bg-gray-900 rotate-45 translate-y-1 mx-auto" />
                </div>
              </div>
            </div>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 mx-2" />

          {/* Auth section */}
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {initials(session.user.name)}
                </div>
                <span>Me</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                  <p className="px-3 pt-1 pb-2 text-[11px] text-gray-400 font-medium truncate border-b border-gray-100">
                    {session.user.name ?? "My Account"}
                  </p>
                  <Link
                    href={portalHref}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-gray-400" />
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-xs font-semibold border border-emerald-700 text-emerald-700 hover:bg-emerald-50 px-4 py-1.5 rounded-full transition-colors"
              >
                Join now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 shadow-md">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-2 px-2 rounded hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              <p className="text-sm text-gray-700 hover:text-emerald-700 font-medium">{item.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{item.tip}</p>
            </Link>
          ))}
          <Link
            href="/suggest-ngo"
            className="block text-sm text-gray-700 hover:text-emerald-700 py-2 px-2 rounded hover:bg-gray-50"
            onClick={() => setMobileOpen(false)}
          >
            Suggest an NGO
          </Link>
          <div className="pt-2 border-t border-gray-100 flex gap-2">
            {session ? (
              <Link href={portalHref} className="flex-1 text-center text-sm font-semibold bg-emerald-700 text-white py-2 rounded-full">
                My Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="flex-1 text-center text-sm font-semibold border border-gray-300 text-gray-700 py-2 rounded-full">
                  Sign in
                </Link>
                <Link href="/signup" className="flex-1 text-center text-sm font-semibold border border-emerald-700 text-emerald-700 py-2 rounded-full">
                  Join now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
