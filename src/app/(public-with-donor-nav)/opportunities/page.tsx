import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Briefcase, Clock, Users, MapPin, Wifi, ChevronRight, Search, DollarSign, GraduationCap, Smartphone } from "lucide-react";
import Navbar from "@/components/Navbar";
import { auth } from "@/lib/auth";
import { matchTrainingModule } from "@/lib/training-curriculum";

const roleTypeLabels: Record<string, { label: string; color: string }> = {
  INTERNSHIP:        { label: "Internship",        color: "bg-blue-50 text-blue-700 border-blue-100" },
  CAREER_TRANSITION: { label: "Career Transition",  color: "bg-purple-50 text-purple-700 border-purple-100" },
  INTERIM:           { label: "Interim Role",        color: "bg-amber-50 text-amber-700 border-amber-100" },
  VOLUNTEER:         { label: "Volunteer",            color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
};

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; compensation?: string }>;
}) {
  const session = await auth();
  const { type, compensation } = await searchParams;

  const roles = await prisma.ngoRole.findMany({
    where: {
      status: "OPEN",
      ...(type && type !== "ALL" ? { roleType: type as "INTERNSHIP" | "CAREER_TRANSITION" | "INTERIM" | "VOLUNTEER" } : {}),
      ...(compensation === "paid" ? { OR: [{ salaryMin: { not: null } }, { salaryMax: { not: null } }] } : {}),
      ...(compensation === "volunteer" ? { salaryMin: null, salaryMax: null } : {}),
    },
    include: {
      ngo: { select: { id: true, orgName: true, logoUrl: true, trustScore: true, state: true } },
      project: { select: { title: true } },
      _count: { select: { applications: true } },
    },
    orderBy: [{ salaryMin: "desc" }, { createdAt: "desc" }],
  });

  const typeFilters = [
    { key: "ALL",               label: "All types" },
    { key: "INTERNSHIP",        label: "Internships" },
    { key: "CAREER_TRANSITION", label: "Career Transition" },
    { key: "INTERIM",           label: "Interim" },
    { key: "VOLUNTEER",         label: "Volunteer" },
  ];

  const compensationFilters = [
    { key: "",         label: "Any pay" },
    { key: "paid",     label: "💰 Paid roles" },
    { key: "volunteer",label: "🤝 Volunteer" },
  ];

  const activeType = type ?? "ALL";
  const activeCompensation = compensation ?? "";

  return (
    <>
      <Navbar session={session} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Open Roles</h1>
          <p className="text-sm text-gray-500 max-w-xl">
            Contribute your skills and time to verified nonprofits. Every completed engagement is recorded
            on your GiveLedger profile — count it as professional experience, a career pivot, or an
            interim role between jobs.
          </p>
        </div>

        {/* Value props */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Internship", desc: "Showcase skills to new employers", color: "bg-blue-50 border-blue-100", dot: "bg-blue-500" },
            { label: "Career Transition", desc: "Acquire skills for a new field", color: "bg-purple-50 border-purple-100", dot: "bg-purple-500" },
            { label: "Interim Role", desc: "Keep your CV active between jobs", color: "bg-amber-50 border-amber-100", dot: "bg-amber-500" },
            { label: "Volunteer", desc: "Give time to causes you care about", color: "bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
          ].map((v) => (
            <div key={v.label} className={`rounded-xl border p-3 ${v.color}`}>
              <div className={`w-2 h-2 rounded-full ${v.dot} mb-2`} />
              <p className="text-xs font-semibold text-gray-900">{v.label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          {/* Compensation filter */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pay:</span>
            {compensationFilters.map((f) => {
              const href = f.key === ""
                ? (activeType === "ALL" ? "/opportunities" : `/opportunities?type=${activeType}`)
                : (activeType === "ALL" ? `/opportunities?compensation=${f.key}` : `/opportunities?type=${activeType}&compensation=${f.key}`);
              return (
                <Link key={f.key} href={href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    activeCompensation === f.key
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
          {/* Role type filter */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Type:</span>
            {typeFilters.map((f) => {
              const href = f.key === "ALL"
                ? (activeCompensation === "" ? "/opportunities" : `/opportunities?compensation=${activeCompensation}`)
                : (activeCompensation === "" ? `/opportunities?type=${f.key}` : `/opportunities?type=${f.key}&compensation=${activeCompensation}`);
              return (
                <Link key={f.key} href={href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    activeType === f.key
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Roles grid */}
        {roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No open roles right now.</p>
            <p className="text-gray-400 text-xs mt-1">Check back soon — NGOs post new opportunities regularly.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {roles.flatMap((role, index) => {
              const typeInfo = roleTypeLabels[role.roleType] ?? roleTypeLabels.VOLUNTEER;
              const betaCard = index === 2 ? (
                <Link
                  key="beta-ugc-card"
                  href="/donor/beta-program"
                  className="group bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl p-5 hover:from-violet-700 hover:to-purple-800 transition-all flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[11px] text-violet-200">GiveLedger Program</p>
                        <p className="text-sm font-semibold text-white group-hover:text-violet-100 transition-colors">
                          Beta Tester &amp; UGC Creator
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white shrink-0">
                      Earn money
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-lg px-3 py-2">
                    <DollarSign className="w-3.5 h-3.5 text-violet-200 shrink-0" />
                    <p className="text-[12px] font-bold text-white">$3,000 – $5,000 / month</p>
                  </div>

                  <p className="text-[11px] text-violet-200 leading-relaxed">
                    Get paid to test apps and create content for brands. Flexible — work from any device on your schedule.
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {["Beta Testing", "UGC Content", "App Reviews", "Brand Campaigns"].map((tag) => (
                      <span key={tag} className="text-[10px] bg-white/10 text-violet-100 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-end mt-auto">
                    <span className="text-xs text-violet-200 group-hover:text-white flex items-center gap-1 transition-colors">
                      View program <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ) : null;
              const skills = role.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean);
              const spotsLeft = role.openings - role._count.applications;
              const trainingMatch = matchTrainingModule(role.skillsRequired, role.title);
              const isPaid = role.salaryMin != null || role.salaryMax != null;

              const salaryLabel =
                role.salaryMin && role.salaryMax
                  ? `$${(role.salaryMin / 1000).toFixed(0)}k – $${(role.salaryMax / 1000).toFixed(0)}k / yr`
                  : role.salaryMin
                  ? `From $${(role.salaryMin / 1000).toFixed(0)}k / yr`
                  : role.salaryMax
                  ? `Up to $${(role.salaryMax / 1000).toFixed(0)}k / yr`
                  : null;

              const roleCard = (
                <Link
                  key={role.id}
                  href={`/opportunities/${role.id}`}
                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col gap-3"
                >
                  {/* NGO + type + pay badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {role.ngo.orgName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-500 truncate">{role.ngo.orgName}</p>
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                          {role.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {isPaid ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-600 text-white border-emerald-600 flex items-center gap-0.5">
                          <DollarSign className="w-2.5 h-2.5" /> Paid
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">
                          Volunteer
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Salary highlight — paid roles only */}
                  {isPaid && salaryLabel && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <p className="text-[12px] font-bold text-emerald-700">{salaryLabel}</p>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {role.timeCommitment}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {role.durationWeeks} weeks
                    </span>
                    <span className="flex items-center gap-1">
                      {role.isRemote
                        ? <><Wifi className="w-3 h-3" /> Remote</>
                        : <><MapPin className="w-3 h-3" /> {role.location ?? "On-site"}</>
                      }
                    </span>
                    {spotsLeft > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                      </span>
                    )}
                  </div>

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          +{skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Project link */}
                  {role.project && (
                    <p className="text-[10px] text-emerald-600 font-medium">
                      Project: {role.project.title}
                    </p>
                  )}

                  {/* AI Training nudge */}
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mt-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <p className="text-[11px] text-emerald-700 leading-snug flex-1">
                      AI can help you excel in this role.{" "}
                      <span className="font-semibold underline underline-offset-2">
                        {trainingMatch.moduleTitle}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-end mt-auto">
                    <span className="text-xs text-gray-400 group-hover:text-emerald-600 flex items-center gap-1 transition-colors">
                      View & apply <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
              return betaCard ? [betaCard, roleCard] : [roleCard];
            })}
          </div>
        )}
      </div>
    </>
  );
}
