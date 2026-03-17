import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import {
  ArrowRight, CheckCircle2, Briefcase, DollarSign, Clock,
  Shield, Star, Zap, Crown, Award, TrendingUp, Users,
  Wifi, MapPin, ChevronRight, Leaf, BadgeCheck, Landmark,
  ExternalLink, RotateCcw, Globe,
} from "lucide-react";

/* ─── Category labels ─────────────────────────────────────── */
const categoryLabels: Record<string, string> = {
  INCOME_GENERATION:  "Income Generation",
  CHILD_CARE:         "Child Care",
  ELDERLY_CARE:       "Elderly Care",
  PHYSICALLY_DISABLED:"Disabled Support",
  PET_CARE:           "Pet Care",
  OTHER:              "Other",
};

const roleTypeLabels: Record<string, { label: string; color: string }> = {
  INTERNSHIP:        { label: "Internship",        color: "bg-blue-50 text-blue-700" },
  CAREER_TRANSITION: { label: "Career Transition",  color: "bg-purple-50 text-purple-700" },
  INTERIM:           { label: "Interim Role",        color: "bg-amber-50 text-amber-700" },
  VOLUNTEER:         { label: "Volunteer",            color: "bg-emerald-50 text-emerald-700" },
};

/* ─── Mock credential card used as "screenshot" ──────────── */
function CredentialMockup() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden w-full max-w-sm">
      {/* Browser chrome */}
      <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 bg-white rounded text-[9px] text-gray-400 px-2 py-0.5 mx-2">
          give-ledger.vercel.app/credential/...
        </div>
      </div>
      {/* Credential content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">GiveLedger</p>
            <p className="text-[9px] text-gray-400">Verified Contribution Credential</p>
          </div>
          <BadgeCheck className="w-4 h-4 text-emerald-500 ml-auto" />
        </div>

        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700">
            SR
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Sarah Ramírez</p>
            <p className="text-[10px] text-gray-400">Marketing Director · San Francisco, CA</p>
          </div>
        </div>

        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Verified Contributions</p>
        <div className="space-y-2">
          {[
            { org: "WaterBridge Foundation", role: "Marketing Strategy Lead", hours: "48h", value: "$1,200", cat: "MARKETING" },
            { org: "Pragati Foundation", role: "Brand Identity Redesign", hours: "32h", value: "$960", cat: "DESIGN" },
          ].map((c) => (
            <div key={c.org} className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-semibold text-gray-800">{c.role}</p>
                <span className="text-[8px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full">{c.cat}</span>
              </div>
              <p className="text-[9px] text-emerald-700">{c.org}</p>
              <div className="flex gap-3 mt-1">
                <p className="text-[9px] text-gray-400">{c.hours} logged</p>
                <p className="text-[9px] font-semibold text-emerald-700">{c.value} value</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
          <Shield className="w-3 h-3 text-emerald-600 shrink-0" />
          <p className="text-[8px] text-gray-500">Verified on Polygon · 2 on-chain records</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Mock opportunity card ───────────────────────────────── */
function OpportunityMockup() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden w-full max-w-xs">
      <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 bg-white rounded text-[9px] text-gray-400 px-2 py-0.5 mx-2">
          give-ledger.vercel.app/opportunities
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Open Roles</p>
        <div className="space-y-2">
          {[
            { title: "Digital Marketing Lead", org: "Pragati Foundation", type: "Career Transition", remote: true, hours: "10h/week", color: "bg-purple-50 text-purple-700" },
            { title: "Legal Compliance Review", org: "WaterBridge Kenya", type: "Internship", remote: true, hours: "6h/week", color: "bg-blue-50 text-blue-700" },
            { title: "Financial Model Audit", org: "SilverYears Trust", type: "Interim Role", remote: false, hours: "15h/week", color: "bg-amber-50 text-amber-700" },
          ].map((r) => (
            <div key={r.title} className="border border-gray-100 rounded-xl p-2.5 hover:border-gray-200">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gray-900 truncate">{r.title}</p>
                  <p className="text-[9px] text-gray-400">{r.org}</p>
                </div>
                <span className={`shrink-0 text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${r.color}`}>
                  {r.type}
                </span>
              </div>
              <div className="flex gap-2 mt-1.5 text-[9px] text-gray-400">
                <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {r.hours}</span>
                <span className="flex items-center gap-0.5">
                  {r.remote ? <><Wifi className="w-2.5 h-2.5" /> Remote</> : <><MapPin className="w-2.5 h-2.5" /> On-site</>}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Mock milestone verification card ───────────────────── */
function MilestoneMockup() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden w-full max-w-xs">
      <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 bg-white rounded text-[9px] text-gray-400 px-2 py-0.5 mx-2">
          give-ledger.vercel.app/projects/...
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Milestone Verified</p>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-xs font-semibold text-gray-900">Phase 1: Community Outreach</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-2 text-center">
              <p className="text-base font-bold text-gray-900">240</p>
              <p className="text-[9px] text-gray-400">Families reached</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center">
              <p className="text-base font-bold text-emerald-700">$4,800</p>
              <p className="text-[9px] text-gray-400">Disbursed</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 mb-2">
          <Shield className="w-3 h-3 text-emerald-600" />
          <p className="text-[8px] text-gray-500">Recorded on Polygon · Tx: 0x7f2a...3bc1</p>
          <ExternalLink className="w-2.5 h-2.5 text-gray-400 ml-auto" />
        </div>
        <p className="text-[9px] text-gray-400">Funded by 8 donors · 2 skill contributors</p>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default async function HomePage() {
  const session = await auth();

  const [
    donorCount,
    ngoCount,
    milestoneCount,
    disbursedTotal,
    openRoles,
    featuredProjects,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "DONOR" } }),
    prisma.ngo.count({ where: { status: "ACTIVE" } }),
    prisma.milestone.count({ where: { status: "COMPLETED" } }),
    prisma.disbursement.aggregate({
      where: { status: "APPROVED" },
      _sum: { requestedAmount: true },
    }),
    prisma.ngoRole.findMany({
      take: 6,
      where: { status: "OPEN" },
      include: {
        ngo: { select: { id: true, orgName: true, state: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      take: 3,
      where: { status: "ACTIVE" },
      include: {
        ngo: { select: { orgName: true } },
        _count: { select: { milestones: true, donations: true } },
      },
      orderBy: { raisedAmount: "desc" },
    }),
  ]);

  const totalDisbursed = disbursedTotal._sum.requestedAmount ?? 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar session={session} />

      {/* ──────────────────────────────────────────────────────── */}
      {/* 1. HERO                                                  */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#052e16] text-white">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
        {/* Gradient fade bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#052e16] to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-900/50 border border-emerald-700/40 rounded-full px-3 py-1.5 text-xs text-emerald-300 mb-6">
                <Zap className="w-3 h-3" />
                Skill contributors earn the same recognition as financial donors
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
                Your skills can <br />
                <span className="text-emerald-400">change lives.</span><br />
                Get certified for it.
              </h1>
              <p className="text-gray-300 text-base leading-relaxed mb-8 max-w-lg">
                GiveLedger connects skilled professionals — marketers, lawyers, developers,
                designers — with verified US nonprofits. Every engagement is confirmed by the NGO,
                assigned a monetary value, and permanently recorded on-chain. It counts as
                certified professional experience.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/opportunities"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
                >
                  Browse Open Roles <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors border border-white/20"
                >
                  View Plans — from $10
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Already have an account?{" "}
                <Link href={session ? (session.user?.role === "NGO" ? "/ngo/dashboard" : "/donor/dashboard") : "/login"} className="text-emerald-400 hover:underline">
                  {session ? "Go to your dashboard" : "Sign in"}
                </Link>
              </p>
            </div>
            {/* Right — credential mockup */}
            <div className="hidden lg:flex justify-center">
              <CredentialMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2. LIVE STATS BAR                                        */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="bg-emerald-700 text-white py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: `$${(totalDisbursed / 1000).toFixed(0)}k+`, label: "Disbursed to NGOs" },
            { value: `${milestoneCount}`, label: "Milestones verified" },
            { value: `${ngoCount}`, label: "Active nonprofits" },
            { value: `${donorCount}+`, label: "Contributors joined" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs text-emerald-200 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 3. THREE CONTRIBUTION TYPES                              */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Three ways to contribute. <span className="text-emerald-700">One platform.</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              GiveLedger treats money, skills, and time as equal contributions. Every form
              earns the same public credit, the same on-chain record, and the same credential.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {/* Skills — featured */}
            <div className="relative bg-emerald-700 text-white rounded-2xl p-6 sm:col-span-1 order-first">
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                  Highlighted
                </span>
              </div>
              <Briefcase className="w-8 h-8 text-emerald-300 mb-4" />
              <h3 className="text-lg font-bold mb-2">Skill Contribution</h3>
              <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                Apply your expertise — marketing, legal, IT, design, fundraising — directly to
                NGO projects. The NGO confirms delivery and assigns a monetary value.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Certified professional experience",
                  "NGO-assigned monetary value",
                  "On-chain record on Polygon",
                  "Counts toward GiveLedger Credential",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-emerald-50 transition-colors"
              >
                Browse open roles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Money */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <DollarSign className="w-8 h-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Financial Donation</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Donate to projects where every dollar is milestone-locked. Funds only release
                when verified evidence of completion is submitted. Every transaction on-chain.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Milestone-locked fund release",
                  "Stripe-powered checkout",
                  "Polygon blockchain record",
                  "Permanent impact certificate",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl text-xs hover:bg-gray-100 transition-colors"
              >
                Browse projects <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Time */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <Clock className="w-8 h-8 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Time Volunteering</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                No specific skill required — contribute your time to NGO operations,
                community events, or field programmes. Every hour is logged and verified.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Log hours directly on platform",
                  "NGO confirms time donated",
                  "Visible on public profile",
                  "Same credential as skill contributors",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl text-xs hover:bg-gray-100 transition-colors"
              >
                Volunteer opportunities <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 4. HOW SKILL CONTRIBUTION WORKS                          */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              For skill contributors
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              How it works — five steps
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              From first click to a credential on your LinkedIn profile in as little as one project.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute left-1/2 top-6 bottom-6 w-px bg-emerald-100 -translate-x-1/2" />

            <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-4">
              {[
                {
                  step: 1, icon: Globe,
                  title: "Browse roles",
                  desc: "Filter by skill category, role type (internship, career transition, interim, volunteer), and commitment.",
                },
                {
                  step: 2, icon: Briefcase,
                  title: "Apply with cover note",
                  desc: "Submit your cover note and links. Basic plan: up to 50 applications. Pro plan: unlimited.",
                },
                {
                  step: 3, icon: Users,
                  title: "NGO reviews & accepts",
                  desc: "The NGO reviews your application. PRO contributors appear first in the review queue.",
                },
                {
                  step: 4, icon: CheckCircle2,
                  title: "Deliver & log hours",
                  desc: "Work with the NGO team. Log hours as you go. The NGO confirms delivery and assigns a monetary value.",
                },
                {
                  step: 5, icon: Award,
                  title: "Credential issued",
                  desc: "An NGO-verified, on-chain contribution record appears on your GiveLedger Credential — ready to share.",
                },
              ].map((s) => (
                <div key={s.step} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center mb-3 shadow-lg">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 mb-1">Step {s.step}</span>
                  <p className="text-sm font-semibold text-gray-900 mb-1.5">{s.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 bg-emerald-700 text-white font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-emerald-800 transition-colors"
            >
              See all open roles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 5. LIVE OPEN ROLES                                       */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Open roles right now</h2>
              <p className="text-gray-500 text-sm mt-1">
                Verified nonprofits actively looking for skilled contributors.
              </p>
            </div>
            <Link href="/opportunities" className="text-sm text-emerald-700 font-medium hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {openRoles.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No open roles at the moment — check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {openRoles.map((role) => {
                const typeInfo = roleTypeLabels[role.roleType] ?? roleTypeLabels.VOLUNTEER;
                const skills = role.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean);
                return (
                  <Link
                    key={role.id}
                    href={`/opportunities/${role.id}`}
                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {role.ngo.orgName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 truncate">{role.ngo.orgName}</p>
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                            {role.title}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {role.timeCommitment}</span>
                      <span className="flex items-center gap-0.5">
                        {role.isRemote ? <><Wifi className="w-3 h-3" /> Remote</> : <><MapPin className="w-3 h-3" /> {role.ngo.state ?? "On-site"}</>}
                      </span>
                      {role._count.applications > 0 && (
                        <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {role._count.applications} applied</span>
                      )}
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        {skills.length > 3 && (
                          <span className="text-[9px] text-gray-400">+{skills.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 6. WHAT YOU GET — side-by-side with opportunity mockup   */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <div className="inline-block bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                What you receive
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                More than volunteering.<br />
                <span className="text-emerald-700">A career asset.</span>
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: Award,
                    color: "text-violet-600 bg-violet-50",
                    title: "GiveLedger Credential",
                    desc: "An exportable credential formatted for LinkedIn certification. Lists every verified engagement, monetary value, and on-chain proof. Not a volunteering note — a specific, certified record of professional work.",
                  },
                  {
                    icon: TrendingUp,
                    color: "text-emerald-600 bg-emerald-50",
                    title: "NGO-assigned monetary value",
                    desc: "The NGO knows what your work is worth in their context. They assign a dollar value to your contribution — $200, $1,000, $5,000. That number appears on your credential and public profile.",
                  },
                  {
                    icon: Users,
                    color: "text-blue-600 bg-blue-50",
                    title: "Access to NGO networks",
                    desc: "NGO boards and leadership include business leaders, community changemakers, and philanthropists. Your contribution earns proximity to these networks — on-platform and off.",
                  },
                  {
                    icon: Shield,
                    color: "text-amber-600 bg-amber-50",
                    title: "Blockchain-verified proof",
                    desc: "Every engagement is recorded on Polygon. Every claim on your credential is verifiable by anyone, anywhere. No one can dispute a record that exists on-chain.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{item.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mockup */}
            <div className="hidden lg:flex justify-center">
              <OpportunityMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 7. PRICING CALLOUT                                       */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl p-8 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-3">Start contributing today</h2>
                <p className="text-emerald-100 text-sm leading-relaxed mb-6">
                  Choose a plan that matches your ambition. One-time fee, no subscription.
                  Pro plan includes a 100% refund after 18 months if you complete one engagement.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-emerald-50 transition-colors"
                >
                  See full pricing <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    plan: "Free",
                    price: "$0",
                    features: ["Browse all roles", "View NGO profiles", "Public credential"],
                    icon: Globe,
                    iconColor: "text-white",
                    bg: "bg-emerald-800/50",
                    border: "border-emerald-700",
                  },
                  {
                    plan: "Basic",
                    price: "$10",
                    features: ["Apply to 50 roles", "Cover note submission", "Engagement tracking"],
                    icon: Zap,
                    iconColor: "text-yellow-300",
                    bg: "bg-emerald-800/50",
                    border: "border-emerald-600",
                  },
                  {
                    plan: "Pro",
                    price: "$25",
                    features: ["Unlimited applies", "Priority listing", "18-month refund"],
                    icon: Crown,
                    iconColor: "text-violet-300",
                    bg: "bg-violet-900/40",
                    border: "border-violet-500",
                    highlight: true,
                  },
                ].map((p) => (
                  <div
                    key={p.plan}
                    className={`${p.bg} border ${p.border} rounded-2xl p-4 text-white flex flex-col gap-2 ${p.highlight ? "ring-2 ring-violet-400/50" : ""}`}
                  >
                    <p.icon className={`w-5 h-5 ${p.iconColor} mb-1`} />
                    <p className="text-sm font-bold">{p.plan}</p>
                    <p className="text-xl font-extrabold">{p.price}</p>
                    <ul className="space-y-1.5 mt-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-[10px] text-emerald-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-300 shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 8. FINANCIAL DONORS — secondary section                  */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Mockup */}
            <div className="hidden lg:flex justify-center">
              <MilestoneMockup />
            </div>
            {/* Copy */}
            <div>
              <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Financial donors
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                Know exactly where<br />
                <span className="text-emerald-700">your money went.</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Every donation on GiveLedger is milestone-locked. Funds stay in escrow until
                the NGO submits verified evidence of completion. When a milestone is verified,
                the release is recorded on the Polygon blockchain — permanently, publicly, and
                without any admin in the loop.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { icon: Landmark, label: "Milestone-locked funding", desc: "Funds release only on verified completion — no up-front lump sum to NGOs." },
                  { icon: Shield, label: "On-chain transparency", desc: "Every disbursement recorded on Polygon. Every transaction verifiable forever." },
                  { icon: Star, label: "Impact certificates", desc: "When a milestone you funded completes, you receive a permanent Impact Certificate." },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-emerald-800 transition-colors"
              >
                Browse projects <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 9. FEATURED PROJECTS                                     */}
      {/* ──────────────────────────────────────────────────────── */}
      {featuredProjects.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Active projects</h2>
                <p className="text-gray-500 text-sm mt-1">Donate to projects with verified milestones in progress.</p>
              </div>
              <Link href="/projects" className="text-sm text-emerald-700 font-medium hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {featuredProjects.map((project) => {
                const pct = Math.min(100, (project.raisedAmount / project.goalAmount) * 100);
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {project.ngo.orgName.slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">{project.ngo.orgName}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {project.title}
                    </p>
                    <span className="inline-block text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mb-3">
                      {categoryLabels[project.category] ?? project.category}
                    </span>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>${project.raisedAmount.toLocaleString()} raised</span>
                      <span>{pct.toFixed(0)}%</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{project._count.milestones} milestones</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 10. FOR NGOs                                             */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#052e16] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-emerald-900/60 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-emerald-700/40">
                For NGOs
              </div>
              <h2 className="text-3xl font-bold mb-5">
                Proof is the price of<br />
                <span className="text-emerald-400">milestone funding.</span>
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                GiveLedger only works for NGOs that are willing to operate transparently.
                Every milestone you set is public. Every fund release is triggered by verified evidence.
                That transparency is what makes donors trust you — and what attracts skilled contributors
                who want to work with credible organisations.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Post open roles and receive applications from skilled professionals",
                  "Endorse contributors — recognition that flows to their public credential",
                  "Get a trust score built on completed, verified milestones",
                  "Every milestone post credits contributors — that content attracts the next donor",
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">{f}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
                >
                  Apply as an NGO <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/ngos"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors border border-white/20"
                >
                  Browse NGOs
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Milestone-locked", desc: "Funds release only when you prove completion — not before.", icon: Shield },
                { label: "Skill recruitment", desc: "Post roles and attract verified professional contributors at no cost.", icon: Briefcase },
                { label: "On-chain record", desc: "Every disbursement on Polygon. Auditable by anyone, anywhere, forever.", icon: Globe },
                { label: "Trust score", desc: "Your score grows with every completed, verified milestone — transparent to all donors.", icon: TrendingUp },
              ].map((item) => (
                <div key={item.label} className="bg-emerald-900/40 border border-emerald-800/60 rounded-xl p-4">
                  <item.icon className="w-5 h-5 text-emerald-400 mb-2" />
                  <p className="text-sm font-semibold text-white mb-1">{item.label}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 11. PRO REFUND CALLOUT                                   */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-2 text-sm text-violet-700 mb-6">
            <RotateCcw className="w-4 h-4" />
            Pro plan: 100% refund after 18 months if you complete one engagement
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            We want to enable you — not charge you.
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-lg mx-auto">
            The $25 Pro plan is not a subscription — it&apos;s a one-time access fee that comes back
            to you in full if you complete at least one engagement within 18 months. If you
            contribute, you get your money back. It&apos;s that simple.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors"
          >
            Learn more about Pro <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 12. FINAL CTA                                            */}
      {/* ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-emerald-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Your skills are worth more<br />than you&apos;re giving them credit for.
          </h2>
          <p className="text-emerald-100 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
            Join GiveLedger. Apply your expertise to verified nonprofits. Build a credential
            that proves every hour you gave — and every outcome it produced.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors"
            >
              Create a free account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3.5 rounded-xl text-sm transition-colors border border-emerald-500"
            >
              Browse open roles
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────── */}
      {/* FOOTER                                                   */}
      {/* ──────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-700 rounded-lg flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-white">GiveLedger</span>
              <span className="text-gray-600 text-xs ml-2">US-based nonprofits only · Polygon blockchain</span>
            </div>
            <div className="flex flex-wrap gap-5 text-xs">
              {[
                { href: "/projects", label: "Projects" },
                { href: "/opportunities", label: "Open Roles" },
                { href: "/pricing", label: "Pricing" },
                { href: "/ngos", label: "NGOs" },
                { href: "/impact", label: "Impact" },
                { href: "/wall", label: "Activity" },
                { href: "/suggest-ngo", label: "Suggest an NGO" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-[11px] text-gray-600">
            GiveLedger is a platform for verified giving. All disbursements recorded on Polygon. Not a financial institution. 501(c)(3) NGO status required for participation.
          </div>
        </div>
      </footer>
    </div>
  );
}
