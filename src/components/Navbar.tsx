"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  session?: { user: { name?: string | null; role: string } } | null;
}

export default function Navbar({ session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardLink = () => {
    if (!session) return "/login";
    if (session.user.role === "DONOR") return "/donor/dashboard";
    if (session.user.role === "NGO") return "/ngo/dashboard";
    if (session.user.role === "ADMIN") return "/admin/dashboard";
    return "/";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-700">
            <Leaf className="w-6 h-6 text-emerald-600" />
            GiveLedger
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#how-it-works" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">
              How It Works
            </Link>
            <Link href="/projects" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">
              Projects
            </Link>
            <Link href="/campaigns" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">
              Campaigns
            </Link>
            <Link href="/impact" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">
              Impact
            </Link>
            <Link href="/#for-ngos" className="text-sm text-gray-600 hover:text-emerald-700 transition-colors">
              For NGOs
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <Link href={getDashboardLink()}>
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/#how-it-works" className="block text-sm text-gray-700 py-2">How It Works</Link>
          <Link href="/projects" className="block text-sm text-gray-700 py-2">Projects</Link>
          <Link href="/campaigns" className="block text-sm text-gray-700 py-2">Campaigns</Link>
          <Link href="/impact" className="block text-sm text-gray-700 py-2">Impact</Link>
          <Link href="/#for-ngos" className="block text-sm text-gray-700 py-2">For NGOs</Link>
          <Link href="/suggest-ngo" className="block text-sm text-gray-700 py-2">Suggest an NGO</Link>
          {session ? (
            <Link href={getDashboardLink()}>
              <Button className="w-full" size="sm">Dashboard</Button>
            </Link>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Log In</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button size="sm" className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
