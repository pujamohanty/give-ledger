"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Leaf, ChevronDown, Search } from "lucide-react";

interface NavbarProps {
  session?: { user: { name?: string | null; role: string } } | null;
}

function initials(name: string | null | undefined) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function Navbar({ session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
            readOnly
            tabIndex={-1}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-0.5">
          {[
            { href: "/projects", label: "Projects" },
            { href: "/campaigns", label: "Campaigns" },
            { href: "/wall", label: "Activity" },
            { href: "/impact", label: "Impact" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 hover:text-gray-900 text-xs font-medium rounded transition-colors group"
            >
              <span className="group-hover:text-gray-900 transition-colors">{item.label}</span>
            </Link>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 mx-2" />

          {/* Auth section */}
          {session ? (
            <Link
              href={portalHref}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {initials(session.user.name)}
              </div>
              <span>Me</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </Link>
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
          {[
            { href: "/projects", label: "Projects" },
            { href: "/campaigns", label: "Campaigns" },
            { href: "/wall", label: "Activity" },
            { href: "/impact", label: "Impact" },
            { href: "/suggest-ngo", label: "Suggest an NGO" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-sm text-gray-700 hover:text-emerald-700 py-2 px-2 rounded hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
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
