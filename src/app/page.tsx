export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import HomeFeedClient from "./HomeFeedClient";
import {
  ArrowRight, CheckCircle2, Briefcase, DollarSign, Clock,
  Shield, Star, Zap, Crown, Award, TrendingUp, Users,
  Wifi, MapPin, ChevronRight, Leaf, BadgeCheck, Landmark,
  ExternalLink, Globe, GraduationCap,
} from "lucide-react";

export const metadata = {
  title: "GiveLedger — Build Verified Proof of What You Stand For",
  description:
    "GiveLedger turns your professional skills into a verified, blockchain-backed credential. Every engagement is NGO-confirmed, permanently recorded on Polygon, and visible to organisations when you apply.",
};

/* ─── Category / role-type labels ────────────────────────── */
const categoryLabels: Record<string, string> = {
  INCOME_GENERATION:   "Income Generation",
  CHILD_CARE:          "Child Care",
  ELDERLY_CARE:        "Elderly Care",
  PHYSICALLY_DISABLED: "Disabled Support",
  PET_CARE:            "Pet Care",
  OTHER:               "Other",
};


/* ─── CSS UI mockups used as "screenshots" ───────────────── */
function CredentialMockup() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden w-full max-w-sm">
      <div className="bg-gray-100 px-3 py-2 flex items-center gap-2 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 bg-white rounded text-[9px] text-gray-400 px-2 py-0.5 mx-2">
          /credential
        </div>
      </div>
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
            { org: "Pragati Foundation",     role: "Brand Identity Redesign", hours: "32h", value: "$960",   cat: "DESIGN" },
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
          /open-roles
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Open Roles</p>
        <div className="space-y-2">
          {[
            { title: "Digital Marketing Lead",  org: "Pragati Foundation",  remote: true,  hours: "10h/week" },
            { title: "Legal Compliance Review", org: "WaterBridge Kenya",   remote: true,  hours: "6h/week"  },
            { title: "Financial Model Audit",   org: "SilverYears Trust",   remote: false, hours: "15h/week" },
          ].map((r) => (
            <div key={r.title} className="border border-gray-100 rounded-xl p-2.5">
              <div className="min-w-0 mb-1.5">
                <p className="text-[11px] font-semibold text-gray-900 truncate">{r.title}</p>
                <p className="text-[9px] text-gray-400">{r.org}</p>
              </div>
              <div className="flex gap-2 text-[9px] text-gray-400">
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
          /projects
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

/* ─── Landing page (logged-out) ──────────────────────────── */
async function LandingPage({ session }: { session: Session | null }) {
  const data = await Promise.all([
    prisma.user.count({ where: { role: "DONOR" } }),
    prisma.ngo.count({ where: { status: "ACTIVE" } }),
    prisma.milestone.count({ where: { status: "COMPLETED" } }),
    prisma.disbursement.aggregate({ where: { status: "APPROVED" }, _sum: { requestedAmount: true } }),
    prisma.ngoRole.findMany({
      take: 6,
      where: { status: "OPEN" },
      include: { ngo: { select: { id: true, orgName: true, state: true } }, _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      take: 3,
      where: { status: "ACTIVE" },
      include: { ngo: { select: { orgName: true } }, _count: { select: { milestones: true, donations: true } } },
      orderBy: { raisedAmount: "desc" },
    }),
    prisma.ngoRole.count({ where: { status: "OPEN" } }),
  ]).catch(() => null);

  const donorCount = data?.[0] ?? 0;
  const ngoCount = data?.[1] ?? 0;
  const milestoneCount = data?.[2] ?? 0;
  const totalDisbursed = data?.[3]._sum.requestedAmount ?? 0;
  const openRoles = data?.[4] ?? [];
  const featuredProjects = data?.[5] ?? [];
  const openRolesCount = data?.[6] ?? 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar session={session} openRolesCount={openRolesCount} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#052e16] text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#052e16] to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-900/50 border border-emerald-700/40 rounded-full px-3 py-1.5 text-xs text-emerald-300 mb-6">
                <Zap className="w-3 h-3" />
                Money, skills, and time earn identical recognition — and identical proof
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
                Every professional<br />
                has a LinkedIn.<br />
                <span className="text-emerald-400">Very few have proof.</span>
              </h1>
              <p className="text-gray-300 text-base leading-relaxed mb-8 max-w-lg">
                GiveLedger turns your professional skills into a verified, blockchain-backed credential.
                Every engagement is NGO-confirmed, assigned a monetary value, and permanently recorded on Polygon.
                Your Impact Score is visible to NGOs when they review your applications. The credential is
                formatted for LinkedIn. The endorsements come from board members, not strangers.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-900/50">
                  Start building my credential <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/opportunities" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 rounded-xl text-sm transition-colors border border-white/20">
                  Browse open roles
                </Link>
              </div>
              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Impact Score visible to NGOs from day one
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Every credential verified on Polygon
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> NGO endorsements appear on your public profile
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-400 hover:underline">Sign in</Link>
              </p>
            </div>
            <div className="hidden lg:flex justify-center">
              <CredentialMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Live stats bar ── */}
      <section className="bg-gray-950 text-white py-8 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: `$${(totalDisbursed / 1000).toFixed(0)}k+`, label: "Disbursed to NGOs",     icon: DollarSign },
              { value: `${milestoneCount}`,                          label: "Milestones verified",   icon: CheckCircle2 },
              { value: `${ngoCount}+`,                               label: "Active nonprofits",     icon: Landmark },
              { value: `${donorCount.toLocaleString()}+`,            label: "Contributors joined",   icon: Users },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <s.icon className="w-4 h-4 text-emerald-500 mb-2" />
                <p className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] text-gray-700 mt-5">
            Live figures from Supabase · Fund releases recorded on Polygon
          </p>
        </div>
      </section>

      {/* ── What you earn here ── */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">What you earn here</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                Not a volunteering certificate.<br />
                <span className="text-emerald-700">A professional credential with proof behind every claim.</span>
              </h2>
              <div className="space-y-5">
                {[
                  { icon: Award,     color: "text-violet-600 bg-violet-50",  title: "GiveLedger Credential",                   desc: "Formatted as a professional certification for LinkedIn and your CV. Every engagement listed by name, with the NGO-assigned monetary value and the on-chain record that makes every claim verifiable. Not a line on a resume — a provable fact." },
                  { icon: TrendingUp,color: "text-emerald-600 bg-emerald-50",title: "NGO-assigned monetary value",               desc: "The NGO assigns a real dollar value to your contribution — $500 to $6,000+ per engagement. That figure appears on your credential, your public profile, and your Impact Certificate. Someone looking at your profile sees exactly what your work was worth." },
                  { icon: Users,     color: "text-blue-600 bg-blue-50",      title: "Named endorsements from board members and founders", desc: "When your engagement completes, the NGO can endorse you by name. These are founders, board members, and executive directors — people with institutional networks and public credibility. A named endorsement from a nonprofit leader carries more weight than a peer recommendation from a colleague." },
                  { icon: Shield,    color: "text-amber-600 bg-amber-50",    title: "Blockchain-verified proof",                desc: "Every engagement recorded on Polygon. Every claim on your credential verifiable by anyone, anywhere, forever. When someone questions whether your contribution was real — you don't explain it. You link to the on-chain record." },
                  { icon: Star,      color: "text-violet-600 bg-violet-50",  title: "Impact Score — visible to NGOs",           desc: "Your Impact Score (0–30) is calculated from your activity on the platform and shown to NGOs when they review your role applications. Contributors with higher scores are prioritised. It starts at zero. It cannot be backdated." },
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
            <div className="hidden lg:flex justify-center"><OpportunityMockup /></div>
          </div>
        </div>
      </section>

      {/* ── FOMO ── */}
      <section className="py-20 bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2 text-sm text-amber-300 mb-5">
              <Zap className="w-4 h-4" />
              The clock is already running
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Your Impact Score is at zero.
              <span className="block text-amber-400 mt-1">Others who joined last month are already at 12 of 30.</span>
            </h2>
            <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
              Impact Score accumulates from your first day and is shown to NGOs when you apply for roles.
              It cannot be backdated. Every month you wait is a month others are building an advantage you cannot recover.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {[
              {
                icon: Users,
                border: "border-l-4 border-violet-500",
                iconColor: "text-violet-400",
                title: "NGOs see PRO applicants first",
                body: "Applicants on the PRO plan are listed at the top of every NGO's review queue — every time, for every role. Every role you apply for while on FREE is reviewed after every PRO applicant. The structural advantage compounds from day one.",
              },
              {
                icon: Clock,
                border: "border-l-4 border-amber-500",
                iconColor: "text-amber-400",
                title: "These spots close",
                body: "Every open role has a spots-remaining counter. When it hits zero, it closes. The paid role at $72k–$95k visible on this platform right now has applicants already. Roles that close with your application unreviewed cannot be reopened for you.",
              },
              {
                icon: Shield,
                border: "border-l-4 border-emerald-500",
                iconColor: "text-emerald-400",
                title: "Your name on the chain — or someone else's",
                body: "Every milestone funded on GiveLedger is recorded on Polygon under the names of the contributors who made it happen. That record is permanent. The milestone completing this month will carry the names of the people who acted — not the people thinking about it.",
              },
            ].map((card) => (
              <div key={card.title} className={`bg-white/5 ${card.border} rounded-2xl p-6`}>
                <card.icon className={`w-6 h-6 ${card.iconColor} mb-3`} />
                <p className="text-sm font-bold text-white mb-2">{card.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-900/50"
            >
              Start building now <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-gray-600 mt-3">Impact Score starts accumulating from your first contribution. Free plan available.</p>
          </div>
        </div>
      </section>

      {/* ── Live open roles ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Open roles right now — spots fill</h2>
              <p className="text-gray-500 text-sm mt-1">Verified nonprofits actively looking for skilled contributors. PRO plan applicants are reviewed first. Roles close when spots fill.</p>
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
                const skills = role.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean);
                const isPaid = role.salaryMin != null || role.salaryMax != null;
                const salaryLabel = isPaid
                  ? (role.salaryMin && role.salaryMax
                      ? `$${Math.round(role.salaryMin / 1000)}k–$${Math.round(role.salaryMax / 1000)}k/yr`
                      : role.salaryMin ? `From $${Math.round(role.salaryMin / 1000)}k/yr` : `Up to $${Math.round(role.salaryMax! / 1000)}k/yr`)
                  : null;
                return (
                  <Link key={role.id} href={`/opportunities/${role.id}`}
                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {role.ngo.orgName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 truncate">{role.ngo.orgName}</p>
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{role.title}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isPaid ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">💰 Paid</span>
                        ) : (
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">🤝 Volunteer</span>
                        )}
                      </div>
                    </div>
                    {isPaid && salaryLabel && (
                      <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5">
                        {salaryLabel}
                      </div>
                    )}
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
                        {skills.length > 3 && <span className="text-[9px] text-gray-400">+{skills.length - 3} more</span>}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
          <p className="text-center text-xs text-gray-400 mt-6">PRO contributors are listed first in every NGO&apos;s application queue.</p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What contributors say</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Real professionals who used GiveLedger to build verified experience while making an impact.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                quote: "I listed my GiveLedger credential on my CV and got asked about it in every interview. It's not a volunteering line — it's a specific, NGO-confirmed project with a dollar value attached. Recruiters take it seriously.",
                name: "Sarah R.",
                title: "Marketing Director",
                city: "San Francisco, CA",
                category: "Marketing",
                hours: "48h contributed",
                value: "$1,200 value",
                color: "bg-violet-50 border-violet-100",
                badge: "text-violet-700 bg-violet-100",
              },
              {
                quote: "The NGO Director endorsed me by name on LinkedIn. She has 11,000 followers. Her post named the specific project, the deliverable, and my contribution. My profile got 340 new views in four days. That kind of third-party recognition is impossible to manufacture — and it came from work I would have done anyway.",
                name: "David K.",
                title: "Strategy Consultant",
                city: "Austin, TX",
                category: "Strategy",
                hours: "55h contributed",
                value: "$2,750 value",
                color: "bg-amber-50 border-amber-100",
                badge: "text-amber-700 bg-amber-100",
              },
              {
                quote: "I'm a lawyer and never thought pro bono work could produce this kind of credible record. The NGO wrote a detailed endorsement, the hours are on-chain, and the whole thing lives on my LinkedIn. It's genuinely impressive.",
                name: "Priya M.",
                title: "Corporate Attorney",
                city: "New York, NY",
                category: "Legal",
                hours: "35h contributed",
                value: "$3,325 value",
                color: "bg-blue-50 border-blue-100",
                badge: "text-blue-700 bg-blue-100",
              },
            ].map((t) => (
              <div key={t.name} className={`rounded-2xl border p-6 ${t.color} flex flex-col`}>
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-5 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-black/5 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.title} · {t.city}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${t.badge}`}>
                      {t.category}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
                    <span>{t.hours}</span>
                    <span className="font-semibold text-emerald-700">{t.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How skill contribution works ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              From sign-up to verified credential
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">From sign-up to credential in 5 steps</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              One completed engagement is all it takes to earn a verified, blockchain-backed credential for your LinkedIn and CV.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { step: 1, icon: Globe,         title: "Browse open roles",       desc: "Filter by skill category, pay type (paid or volunteer), and weekly time commitment.",          color: "bg-emerald-700" },
              { step: 2, icon: Briefcase,     title: "Apply with a cover note", desc: "Submit your application in under two minutes. Basic plan: up to 50 applications. Pro plan: unlimited.",                          color: "bg-emerald-700" },
              { step: 3, icon: Users,         title: "NGO reviews and accepts", desc: "The organisation reviews applications. PRO plan contributors are listed first — every time, for every role. Your plan position determines your review position.",                                  color: "bg-emerald-700" },
              { step: 4, icon: CheckCircle2,  title: "Deliver and log hours",   desc: "Work directly with the NGO team. Log your hours on the platform. The NGO confirms delivery and assigns a dollar value.",           color: "bg-emerald-700" },
              { step: 5, icon: Award,         title: "Credential issued",       desc: "An NGO-verified, on-chain record appears on your GiveLedger Credential — formatted for LinkedIn, shareable as a post, and visible on your public profile. The NGO can endorse you by name. That endorsement appears permanently under your work record.",                color: "bg-violet-700"  },
            ].map((s) => (
              <div key={s.step} className={`flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm ${s.step === 5 ? "sm:col-span-2 sm:max-w-md sm:mx-auto w-full" : ""}`}>
                <div className={`w-10 h-10 rounded-xl ${s.color} text-white flex items-center justify-center shrink-0 font-extrabold text-sm`}>
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{s.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/opportunities" className="inline-flex items-center gap-2 bg-emerald-700 text-white font-semibold px-8 py-3.5 rounded-xl text-sm hover:bg-emerald-800 transition-colors">
              See all open roles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Three contribution types ── */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Contribute what you have. <span className="text-emerald-700">Build the same credential.</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Money, skills, and time are equal here. A 40-hour finance engagement and a $1,000 donation produce the same
              on-chain record, the same Impact Certificate, and the same credential entry. You don&apos;t need to be wealthy to have standing.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="relative bg-emerald-700 text-white rounded-2xl p-6">
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Highlighted</span>
              </div>
              <Briefcase className="w-8 h-8 text-emerald-300 mb-4" />
              <h3 className="text-lg font-bold mb-2">Skill Contribution</h3>
              <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                Apply your expertise — marketing, legal, IT, design, fundraising — directly to NGO projects.
                The NGO confirms delivery and assigns a monetary value.
              </p>
              <ul className="space-y-2 mb-6">
                {["Certified professional experience", "NGO-assigned monetary value", "On-chain record on Polygon", "Counts toward GiveLedger Credential"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/opportunities" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-emerald-50 transition-colors">
                Browse open roles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Financial Donation</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Donate to projects where every dollar is milestone-locked. Funds only release when
                verified evidence of completion is submitted. Every transaction on-chain.
              </p>
              <ul className="space-y-2 mb-6">
                {["Milestone-locked fund release", "Stripe-powered checkout", "Polygon blockchain record", "Permanent impact certificate"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/projects" className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-emerald-100 transition-colors">
                Browse projects <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-white border-2 border-violet-100 rounded-2xl p-6 hover:border-violet-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Time Volunteering</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Contribute your time to NGO operations, community events, or field programmes.
                Every hour is logged and verified by the NGO.
              </p>
              <ul className="space-y-2 mb-6">
                {["Log hours directly on platform", "NGO confirms time donated", "Visible on public profile", "Same credential as skill contributors"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/opportunities" className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-violet-100 transition-colors">
                Apply and build my credential <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Training Academy ── */}
      <section className="py-20 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 text-sm text-emerald-300 mb-5">
              <GraduationCap className="w-4 h-4" />
              Included with every account
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              AI Training Academy
              <span className="block text-emerald-400 mt-1">42+ hours. On your credential.</span>
            </h2>
            <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
              While most professionals are still learning AI reactively — watching YouTube, searching Reddit — contributors here
              get a structured 42-hour curriculum across 12 modules covering every business function. Sharing your training
              progress adds to your Impact Score. NGOs can see it.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap mb-14 text-center">
            {[
              { value: "12", label: "Modules" },
              { value: "80+", label: "Lessons" },
              { value: "42+", label: "Hours" },
              { value: "$2,500", label: "Market value" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* Example prompts showcase */}
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {[
              {
                module: "Marketing",
                title: "Write a grant proposal in 3 minutes",
                prompt: "I run a US 501(c)(3) focused on clean water access in rural communities. Write a 1,500-word grant proposal for a $50,000 grant from the XYZ Foundation. Include: executive summary, problem statement with statistics, our programme description, budget narrative, expected outcomes, and evaluation plan.",
                outcome: "A complete, funder-ready grant proposal, fully formatted and ready to customise.",
              },
              {
                module: "Finance",
                title: "Build a donor impact report",
                prompt: "Here is our Q3 data: [paste spreadsheet]. Create a donor impact report showing how each dollar was spent, 3 specific beneficiary outcomes, programme costs per person served, and a projection for Q4. Use clear language for non-financial readers.",
                outcome: "A transparent, credible impact report your major donors will actually read.",
              },
              {
                module: "Operations",
                title: "Generate a 90-day SOP from scratch",
                prompt: "We are a nonprofit that provides meals to homeless individuals. We run a daily food distribution operation with 15 volunteers. Write a complete Standard Operating Procedure manual — covering intake, food safety, volunteer roles, incident response, and daily checklist. Format for easy printing.",
                outcome: "A complete operations manual that protects your organisation and trains new volunteers.",
              },
            ].map((ex) => (
              <div key={ex.title} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-white/10">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">{ex.module}</span>
                  <h3 className="text-sm font-bold text-white mt-1">{ex.title}</h3>
                </div>
                <div className="px-5 py-4 bg-gray-900/60 font-mono text-[11px] text-gray-300 leading-relaxed flex-1">
                  &ldquo;{ex.prompt.slice(0, 140)}…&rdquo;
                </div>
                <div className="px-5 py-3 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400 leading-relaxed">{ex.outcome}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Coverage grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {[
              { area: "Marketing & Growth",    desc: "Donor emails, grant proposals, social campaigns, annual reports" },
              { area: "Finance & Accounting",  desc: "Budgets, audit prep, cash flow forecasts, board packs" },
              { area: "Operations & Projects", desc: "SOPs, vendor contracts, project plans, risk registers" },
              { area: "HR & People",           desc: "Job descriptions, onboarding, performance reviews, policies" },
              { area: "Legal & Compliance",    desc: "Bylaws, FOIA templates, 501(c)(3) compliance checklists" },
              { area: "Data & Impact",         desc: "Dashboards, outcome reports, funder data requests, evaluations" },
              { area: "Product & Technology",  desc: "Build internal tools, automate data flows, API integrations" },
              { area: "AI Strategy",           desc: "Lead AI adoption, build policies, train your team, measure ROI" },
            ].map(({ area, desc }) => (
              <div key={area} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs font-bold text-white mb-1">{area}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors"
            >
              Get access + start building my score <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-gray-500 mt-3">No credit card required. All training is permanently included for contributors.</p>
          </div>
        </div>
      </section>

      {/* ── Financial donors ── */}
      <section className="py-20 bg-[#f8faf9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="hidden lg:flex justify-center"><MilestoneMockup /></div>
            <div>
              <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">If you give money</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                Know exactly what your money did.<br />
                <span className="text-emerald-700">And have the proof to show it.</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Every donation is milestone-locked. Funds stay in escrow until the NGO submits
                verified evidence of completion. When a milestone is verified, the release is
                recorded on Polygon — permanently, publicly, without any admin in the loop.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { icon: Landmark, label: "Milestone-locked funding",  desc: "Funds release only on verified completion — not before." },
                  { icon: Shield,   label: "On-chain transparency",      desc: "Every disbursement on Polygon. Auditable by anyone, forever." },
                  { icon: Star,     label: "Impact certificates",        desc: "When a milestone you funded completes, you receive a permanent Impact Certificate." },
                  { icon: Crown,    label: "Named on every milestone you fund", desc: "When a milestone you contributed to completes, your name is recorded on-chain under that outcome — permanently. The project's Supporters leaderboard shows your contribution rank. The #1 contributor receives a Crown badge." },
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
              <Link href="/projects" className="inline-flex items-center gap-2 bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-emerald-800 transition-colors">
                Fund this milestone — earn an Impact Certificate <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured projects ── */}
      {featuredProjects.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Active projects</h2>
                <p className="text-gray-500 text-sm mt-1">Every project shows live milestone progress. Your name goes on the chain when a milestone you funded completes.</p>
              </div>
              <Link href="/projects" className="text-sm text-emerald-700 font-medium hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {featuredProjects.map((project) => {
                const pct = Math.min(100, (project.raisedAmount / project.goalAmount) * 100);
                return (
                  <Link key={project.id} href={`/projects/${project.id}`}
                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {project.ngo.orgName.slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">{project.ngo.orgName}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2">{project.title}</p>
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
                    <p className="text-[10px] text-gray-400 mt-1">{project._count.milestones} milestones · {project._count.donations} donors</p>
                    <p className="text-[10px] text-emerald-700 mt-1 font-medium">Your name on the chain when funded milestones complete.</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── NGO Sector Scale ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-4">
              The scale of what you&apos;re entering
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              $2.8 trillion. 1.54 million organisations.<br className="hidden sm:block" /> All of them need what you already know.
            </h2>
            <p className="text-gray-500 text-base max-w-2xl mx-auto">
              The US nonprofit sector is the third-largest employer in the country. Every one of these organisations runs on
              the same professional skills you use every week. Most cannot afford to hire them at market rates.
              GiveLedger is where that gap meets your credential.
            </p>
          </div>

          {/* Macro stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { stat: "$2.8T",     label: "Total sector assets",        sub: "Larger than the entire UK economy" },
              { stat: "1.54M",     label: "Registered nonprofits",      sub: "IRS-recognised organisations in the US" },
              { stat: "12.3M",     label: "Paid employees",             sub: "10% of the entire US private workforce" },
              { stat: "$167B",     label: "Annual volunteer labour",    sub: "Equivalent market value per year" },
            ].map((s) => (
              <div key={s.stat} className="bg-gray-50 rounded-2xl p-5 text-center">
                <p className="text-3xl font-extrabold text-emerald-700 mb-1">{s.stat}</p>
                <p className="text-sm font-semibold text-gray-800 mb-1">{s.label}</p>
                <p className="text-[11px] text-gray-400">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Skills ticker */}
          <div className="mb-12 overflow-hidden">
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              Skills NGOs urgently need
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Software Engineering","Digital Marketing","Legal & Compliance","Finance & Accounting","Data & Analytics","UX Design","Cybersecurity","Strategy & Ops","HR & People","Communications","AI & Automation","Project Management"].map((s) => (
                <span key={s} className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Sub-sectors */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-center mb-6">
              Range of organisations
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {[
                { sector: "Healthcare & Hospitals",   share: "30%", icon: "🏥" },
                { sector: "Education & Research",     share: "25%", icon: "📚" },
                { sector: "Human Services",           share: "15%", icon: "🤝" },
                { sector: "Environment & Climate",    share: "8%",  icon: "🌿" },
                { sector: "Arts & Culture",           share: "6%",  icon: "🎨" },
                { sector: "International Relief",     share: "5%",  icon: "🌍" },
              ].map((s) => (
                <div key={s.sector} className="flex flex-col items-center gap-2">
                  <span className="text-2xl">{s.icon}</span>
                  <p className="text-lg font-extrabold text-gray-900">{s.share}</p>
                  <p className="text-[11px] text-gray-500 leading-tight">{s.sector}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">
              Source: National Center for Charitable Statistics · IRS Business Master File · Independent Sector 2023
            </p>
          </div>

          {/* CTA bridge */}
          <div className="mt-12 text-center">
            <p className="text-base text-gray-600 max-w-xl mx-auto mb-5">
              These organisations need your skills right now. The contributors who apply this month will have endorsements,
              credentials, and Impact Scores that others cannot catch up to.
            </p>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Browse open roles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── For NGOs ── */}
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
                GiveLedger only works for NGOs willing to operate transparently. Every milestone
                you set is public. Every fund release is triggered by verified evidence. That
                transparency is what attracts both financial donors and skilled contributors.
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
                <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                  Apply as an NGO <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/ngos" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors border border-white/20">
                  Browse NGOs
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Milestone-locked",  desc: "Funds release only when you prove completion — not before.",                    icon: Shield    },
                { label: "Skill recruitment", desc: "Post roles and attract verified professional contributors at no cost.",          icon: Briefcase },
                { label: "On-chain record",   desc: "Every disbursement on Polygon. Auditable by anyone, anywhere, forever.",        icon: Globe     },
                { label: "Trust score",       desc: "Your score grows with every completed, verified milestone — transparent to all.", icon: TrendingUp},
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

      {/* ── Pricing callout ── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl p-8 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <h2 className="text-2xl font-bold mb-3">Start contributing today</h2>
                <p className="text-emerald-100 text-sm leading-relaxed mb-6">
                  One-time fee. The credential, the Impact Score, and every on-chain record are permanent. No recurring cost.
                </p>
                <Link href="/pricing" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-emerald-50 transition-colors">
                  See full pricing <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { plan: "Free",  price: "$0",  features: ["Browse all roles", "View NGO profiles", "Public credential", "Reviewed after PRO & BASIC"],            icon: Globe,  iconColor: "text-white",         bg: "bg-emerald-800/50", border: "border-emerald-700" },
                  { plan: "Basic", price: "$10", features: ["Apply to 50 roles", "Cover note submission", "Engagement tracking", "Reviewed before FREE"],     icon: Zap,    iconColor: "text-yellow-300",    bg: "bg-emerald-800/50", border: "border-emerald-600" },
                  { plan: "Pro",   price: "$25", features: ["First in every queue", "Unlimited applies", "Priority listing", "PRO badge + Beta Program"],             icon: Crown,  iconColor: "text-violet-300",    bg: "bg-violet-900/40",  border: "border-violet-500",  highlight: true },
                ].map((p) => (
                  <div key={p.plan} className={`${p.bg} border ${p.border} rounded-2xl p-4 text-white flex flex-col gap-2 ${p.highlight ? "ring-2 ring-violet-400/50" : ""}`}>
                    <p.icon className={`w-5 h-5 ${p.iconColor} mb-1`} />
                    <p className="text-sm font-bold">{p.plan}</p>
                    <p className="text-xl font-extrabold">{p.price}</p>
                    <ul className="space-y-1.5 mt-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-[10px] text-emerald-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-300 shrink-0 mt-0.5" />{f}
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

      {/* ── Final CTA ── */}
      <section className="py-24 bg-[#052e16] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-900/50 border border-emerald-700/40 rounded-full px-3 py-1.5 text-xs text-emerald-300 mb-6">
            <Zap className="w-3 h-3" /> Every contributor who joined before you has a head start on their Impact Score
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
            Your Impact Score is at zero.<br />
            The credential you could be building<br />
            <span className="text-emerald-400">is accumulating for someone else.</span>
          </h2>
          <p className="text-gray-300 text-base leading-relaxed mb-8 max-w-lg mx-auto">
            The contributors who joined last month already have endorsements, completed engagements, and on-chain records.
            That gap widens every month. The credential is permanent. The score is visible. The milestone with your name
            on it is either happening now or happening for someone else.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-900/50">
              Start building my credential <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/opportunities" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-4 rounded-xl text-sm transition-colors border border-white/20">
              Browse open roles
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />Impact Score starts at zero — starts building on your first contribution</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />Every credential verified on Polygon · Permanently</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-400 pt-14 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-emerald-700 rounded-lg flex items-center justify-center">
                  <Leaf className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-white">GiveLedger</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                A platform for verified giving. Skills, money, and time — all recognised equally.
              </p>
              <p className="text-[11px] text-gray-700">US-based nonprofits only · Polygon blockchain</p>
            </div>
            {/* Platform */}
            <div>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-4">Platform</p>
              <ul className="space-y-2.5 text-xs">
                {[
                  { href: "/projects",    label: "Browse Projects"    },
                  { href: "/opportunities", label: "Open Roles"       },
                  { href: "/campaigns",   label: "Campaigns"          },
                  { href: "/wall",        label: "Activity Feed"      },
                  { href: "/impact",      label: "Platform Impact"    },
                  { href: "/donors",      label: "Contributors"       },
                ].map((l) => (
                  <li key={l.href}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            {/* For contributors */}
            <div>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-4">For Contributors</p>
              <ul className="space-y-2.5 text-xs">
                {[
                  { href: "/pricing",         label: "Pricing Plans"        },
                  { href: "/donor/training",   label: "AI Training Academy"  },
                  { href: "/donor/credential", label: "My Credential"        },
                  { href: "/signup",           label: "Create my account"    },
                  { href: "/login",            label: "Sign In"              },
                ].map((l) => (
                  <li key={l.href}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            {/* For NGOs */}
            <div>
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-4">For NGOs</p>
              <ul className="space-y-2.5 text-xs">
                {[
                  { href: "/ngos",        label: "Browse NGOs"      },
                  { href: "/signup",      label: "Apply as NGO"     },
                  { href: "/suggest-ngo", label: "Suggest an NGO"   },
                ].map((l) => (
                  <li key={l.href}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-[11px] text-gray-700">
              © 2026 GiveLedger. All disbursements recorded on Polygon. Not a financial institution. 501(c)(3) NGO status required.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-700">
              <Shield className="w-3 h-3 text-emerald-700" />
              Secured · Blockchain-verified · US only
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Feed page (logged-in) ──────────────────────────────── */
async function FeedPage({ session }: { session: Session | null }) {
  const LIMIT = 20;

  const data = await Promise.all([
    prisma.activityEvent.findMany({ take: LIMIT + 1, orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where: { role: "DONOR" } }),
    prisma.ngo.count({ where: { status: "ACTIVE" } }),
    prisma.project.count(),
    prisma.milestone.count({ where: { status: "COMPLETED" } }),
    prisma.project.findMany({
      take: 3,
      where: { status: "ACTIVE" },
      include: { ngo: { select: { orgName: true } } },
      orderBy: { raisedAmount: "desc" },
    }),
    prisma.ngo.findMany({
      take: 5,
      where: { status: "ACTIVE" },
      select: { id: true, orgName: true, description: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      include: { ngo: { select: { orgName: true } }, _count: { select: { milestones: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ngoRole.findMany({
      take: 4,
      where: { status: "OPEN" },
      include: { ngo: { select: { id: true, orgName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ngoRole.count({ where: { status: "OPEN" } }),
    session?.user?.role === "DONOR"
      ? prisma.subscription.findUnique({ where: { userId: session.user.id }, select: { plan: true } })
      : Promise.resolve(null),
  ]).catch(() => null);

  const events = data?.[0] ?? [];
  const donorCount = data?.[1] ?? 0;
  const ngoCount = data?.[2] ?? 0;
  const projectCount = data?.[3] ?? 0;
  const milestoneCount = data?.[4] ?? 0;
  const featuredProjectsRaw = data?.[5] ?? [];
  const recentNgosRaw = data?.[6] ?? [];
  const allProjectsRaw = data?.[7] ?? [];
  const openRolesRaw = data?.[8] ?? [];
  const openRolesCount = data?.[9] ?? 0;
  const subscription = data?.[10] ?? null;

  const isPro = subscription?.plan === "PRO";

  const hasMore = events.length > LIMIT;
  const items   = hasMore ? events.slice(0, LIMIT) : events;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} openRolesCount={openRolesCount} isPro={isPro} />
      <HomeFeedClient
        initial={items.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() }))}
        initialCursor={nextCursor}
        stats={{ donors: donorCount, ngos: ngoCount, projects: projectCount, milestones: milestoneCount }}
        featuredProjects={featuredProjectsRaw.map((p) => ({
          id: p.id, title: p.title, category: p.category,
          goalAmount: p.goalAmount, raisedAmount: p.raisedAmount, ngo: p.ngo,
        }))}
        recentNgos={recentNgosRaw}
        openRoles={openRolesRaw.map((r) => ({
          id: r.id, title: r.title, roleType: r.roleType,
          timeCommitment: r.timeCommitment, isRemote: r.isRemote,
          salaryMin: r.salaryMin ?? null,
          salaryMax: r.salaryMax ?? null,
          ngo: { id: r.ngo.id, orgName: r.ngo.orgName },
        }))}
        openRolesCount={openRolesCount}
        allProjects={allProjectsRaw.map((p) => ({
          id: p.id, title: p.title, category: p.category,
          goalAmount: p.goalAmount, raisedAmount: p.raisedAmount, ngo: p.ngo,
          milestoneCount: p._count.milestones,
          createdAt: p.createdAt.toISOString(),
        }))}
        session={session?.user ? {
          name: session.user.name,
          image: session.user.image,
          role: (session.user as { role?: string }).role,
        } : null}
      />
    </div>
  );
}

/* ─── Root page — branches on session ───────────────────── */
export default async function HomePage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // stale JWT or auth error — treat as guest
  }
  try {
    if (session?.user) return <FeedPage session={session} />;
    return <LandingPage session={session} />;
  } catch (err) {
    console.error("[HomePage] render error:", err);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Back in a moment</h1>
          <p className="text-gray-500 mb-6">
            GiveLedger is undergoing a brief maintenance window. Please refresh in a few minutes.
          </p>
          <a href="/" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-800 transition">
            Try again
          </a>
        </div>
      </div>
    );
  }
}
