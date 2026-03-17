import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import RoleApplyButton from "@/components/RoleApplyButton";
import RoleChatBot from "@/components/RoleChatBot";
import {
  Briefcase, Clock, Users, MapPin, Wifi, ArrowLeft,
  Building2, CheckCircle, Calendar, Star, Lock,
} from "lucide-react";

const roleTypeLabels: Record<string, { label: string; color: string; description: string }> = {
  INTERNSHIP: {
    label: "Internship",
    color: "bg-blue-50 text-blue-700 border-blue-100",
    description: "Build real experience and showcase your skills. Ideal for early-career professionals and students looking to demonstrate ability in a new field.",
  },
  CAREER_TRANSITION: {
    label: "Career Transition",
    color: "bg-purple-50 text-purple-700 border-purple-100",
    description: "Acquire hands-on skills in a new discipline. A structured way to build your portfolio in the area you are pivoting into.",
  },
  INTERIM: {
    label: "Interim Role",
    color: "bg-amber-50 text-amber-700 border-amber-100",
    description: "A meaningful, verifiable role to fill a gap in your professional timeline. All work is confirmed and recorded on your GiveLedger credential.",
  },
  VOLUNTEER: {
    label: "Volunteer",
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    description: "Contribute your skills and time to a cause you care about. All contributions are verified by the NGO and recognised on your profile.",
  },
};

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const role = await prisma.ngoRole.findUnique({
    where: { id },
    include: {
      ngo: {
        select: {
          id: true, orgName: true, logoUrl: true, trustScore: true,
          state: true, website: true, description: true,
          boardMembers: { select: { name: true, role: true }, take: 3 },
        },
      },
      project: { select: { id: true, title: true, description: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!role) notFound();

  // Check if logged-in donor already applied + subscription status
  let alreadyApplied = false;
  let donorProfile: { linkedinUrl?: string | null; portfolioUrl?: string | null } | null = null;
  let subscriptionPlan: string = "FREE";
  let appsUsed = 0;
  if (session?.user?.role === "DONOR") {
    const [existing, sub, profile] = await Promise.all([
      prisma.roleApplication.findUnique({
        where: { roleId_applicantId: { roleId: id, applicantId: session.user.id } },
      }),
      prisma.subscription.findUnique({
        where: { userId: session.user.id },
        select: { plan: true, applicationsUsed: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { linkedinUrl: true, portfolioUrl: true },
      }),
    ]);
    alreadyApplied = !!existing;
    subscriptionPlan = sub?.plan ?? "FREE";
    appsUsed = sub?.applicationsUsed ?? 0;
    donorProfile = profile;
  }

  const typeInfo = roleTypeLabels[role.roleType] ?? roleTypeLabels.VOLUNTEER;
  const skills = role.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean);
  const spotsLeft = Math.max(0, role.openings - role._count.applications);
  const isOpen = role.status === "OPEN" && spotsLeft > 0;

  return (
    <>
      <Navbar session={session} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> All opportunities
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Role header */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {role.ngo.orgName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/ngo/${role.ngo.id}`} className="text-xs text-gray-500 mb-0.5 hover:underline hover:text-emerald-700 block">
                    {role.ngo.orgName}
                  </Link>
                  <h1 className="text-xl font-bold text-gray-900">{role.title}</h1>
                  {role.department && <p className="text-sm text-gray-500 mt-0.5">{role.department}</p>}
                </div>
              </div>

              {/* Type badge + meta */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> {role.timeCommitment}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  <Briefcase className="w-3 h-3" /> {role.durationWeeks} weeks
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {role.isRemote
                    ? <><Wifi className="w-3 h-3" /> Remote</>
                    : <><MapPin className="w-3 h-3" /> {role.location ?? "On-site"}</>
                  }
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  <Users className="w-3 h-3" /> {role.openings} opening{role.openings !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Type description */}
              <div className={`rounded-lg border p-3.5 text-xs text-gray-600 ${typeInfo.color}`}>
                {typeInfo.description}
              </div>
            </div>

            {/* Role description */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">About this role</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{role.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">What you&apos;ll do</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{role.responsibilities}</p>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Skills you&apos;ll use</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Linked project */}
            {role.project && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Linked project</h2>
                <Link href={`/projects/${role.project.id}`} className="group flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {role.project.title}
                    </p>
                    {role.project.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{role.project.description}</p>
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* What you get */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">What you get from this role</h2>
              <ul className="space-y-2.5">
                {[
                  "A verified engagement record on your GiveLedger credential, confirmed by the NGO",
                  "NGO-endorsed SkillContribution entry — publicly visible on your profile",
                  "Estimated monetary value assigned by the NGO (useful for CV and LinkedIn)",
                  "Direct connection to the NGO's programme team and leadership",
                  "Contribution counts toward your GiveLedger standing and social recognition score",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                    <Star className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">

            {/* Apply card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-20">
              {role.applicationDeadline && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  Deadline: {new Date(role.applicationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              )}

              {!isOpen ? (
                <div className="text-center py-2">
                  <p className="text-sm font-medium text-gray-500">
                    {role.status === "CLOSED" ? "This role is closed" : "All spots filled"}
                  </p>
                </div>
              ) : alreadyApplied ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Application submitted</p>
                  <p className="text-xs text-gray-500 mt-1">The NGO will review and get back to you.</p>
                </div>
              ) : !session ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 text-center mb-3">Sign in to apply for this role</p>
                  <Link href="/login" className="block w-full text-center bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-emerald-800 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/signup" className="block w-full text-center border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    Create account
                  </Link>
                </div>
              ) : session.user.role !== "DONOR" ? (
                <p className="text-xs text-gray-500 text-center">Only donors can apply to roles.</p>
              ) : subscriptionPlan === "FREE" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3">
                    <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                    <p className="text-xs text-gray-500 text-center">A paid plan is required to apply to roles.</p>
                  </div>
                  <Link href="/pricing" className="block w-full text-center bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-emerald-800 transition-colors">
                    View plans — from $10
                  </Link>
                </div>
              ) : subscriptionPlan === "BASIC" && appsUsed >= 50 ? (
                <div className="space-y-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-amber-800">Application limit reached</p>
                    <p className="text-xs text-amber-600 mt-1">You&apos;ve used all 50 Basic applications. Upgrade to Pro for unlimited access.</p>
                  </div>
                  <Link href="/pricing" className="block w-full text-center bg-violet-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-violet-700 transition-colors">
                    Upgrade to Pro — $25
                  </Link>
                </div>
              ) : (
                <RoleApplyButton
                  roleId={role.id}
                  roleTitle={role.title}
                  defaultLinkedin={donorProfile?.linkedinUrl ?? ""}
                  defaultPortfolio={donorProfile?.portfolioUrl ?? ""}
                />
              )}

              {isOpen && spotsLeft <= 3 && (
                <p className="text-[11px] text-amber-600 text-center mt-2">
                  Only {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} remaining
                </p>
              )}
            </div>

            {/* NGO card */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">About the organisation</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {role.ngo.orgName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <Link href={`/ngo/${role.ngo.id}`} className="text-sm font-semibold text-gray-900 hover:underline hover:text-emerald-700">
                    {role.ngo.orgName}
                  </Link>
                  {role.ngo.state && (
                    <p className="text-[11px] text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {role.ngo.state}, US
                    </p>
                  )}
                </div>
              </div>
              {role.ngo.description && (
                <p className="text-xs text-gray-500 line-clamp-3 mb-3">{role.ngo.description}</p>
              )}
              {role.ngo.trustScore > 0 && (
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-gray-600">Trust score: <strong>{role.ngo.trustScore.toFixed(1)}</strong></span>
                </div>
              )}
              {role.ngo.boardMembers.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Leadership</p>
                  <div className="space-y-1">
                    {role.ngo.boardMembers.map((m) => (
                      <div key={m.name} className="flex items-center gap-2">
                        <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                        <p className="text-xs text-gray-600">{m.name} · <span className="text-gray-400">{m.role}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Link
                href={`/ngo/${role.ngo.id}`}
                className="mt-3 block text-center text-xs text-emerald-700 font-medium hover:underline"
              >
                View full NGO profile →
              </Link>
            </div>

          </div>
        </div>
      </div>
      <RoleChatBot roleId={role.id} roleTitle={role.title} ngoName={role.ngo.orgName} />
    </>
  );
}
