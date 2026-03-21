import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import {
  Search, Briefcase, Building2, Users, Megaphone, FolderOpen,
  ChevronRight, MapPin, DollarSign, Clock, Wifi,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  CLEAN_WATER: "Clean Water", EDUCATION: "Education", HEALTHCARE: "Healthcare",
  FOOD_SECURITY: "Food Security", ENVIRONMENT: "Environment", WOMEN_EMPOWERMENT: "Women's Empowerment",
  ELDERLY_CARE: "Elderly Care", CHILDREN: "Children", DISABILITY: "Disability Support",
  INCOME_GENERATION: "Income Generation", MENTAL_HEALTH: "Mental Health", OTHER: "Other",
};


type Tab = "all" | "projects" | "ngos" | "roles" | "campaigns" | "people";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const session = await auth();
  const { q, type } = await searchParams;
  const query = q?.trim() ?? "";
  const activeTab: Tab = (type as Tab) ?? "all";

  if (!query) {
    return (
      <>
        <Navbar session={session} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Search GiveLedger</h1>
          <p className="text-sm text-gray-400">
            Search for projects, NGOs, open roles, campaigns, and contributors.
          </p>
        </div>
      </>
    );
  }

  const contains = { contains: query, mode: "insensitive" as const };
  const LIMIT = activeTab === "all" ? 4 : 20;

  const [projects, ngos, roles, campaigns, people] = await Promise.all([
    (activeTab === "all" || activeTab === "projects")
      ? prisma.project.findMany({
          where: {
            status: "ACTIVE",
            OR: [{ title: contains }, { description: contains }],
          },
          include: { ngo: { select: { orgName: true } } },
          take: LIMIT,
          orderBy: { raisedAmount: "desc" },
        })
      : Promise.resolve([]),

    (activeTab === "all" || activeTab === "ngos")
      ? prisma.ngo.findMany({
          where: {
            status: "ACTIVE",
            OR: [{ orgName: contains }, { description: contains }],
          },
          include: { _count: { select: { projects: true } } },
          take: LIMIT,
          orderBy: { trustScore: "desc" },
        })
      : Promise.resolve([]),

    (activeTab === "all" || activeTab === "roles")
      ? prisma.ngoRole.findMany({
          where: {
            status: "OPEN",
            OR: [{ title: contains }, { description: contains }, { skillsRequired: contains }],
          },
          include: { ngo: { select: { id: true, orgName: true } } },
          take: LIMIT,
          orderBy: [{ salaryMin: "desc" }, { createdAt: "desc" }],
        })
      : Promise.resolve([]),

    (activeTab === "all" || activeTab === "campaigns")
      ? prisma.campaign.findMany({
          where: {
            OR: [{ title: contains }, { description: contains }],
          },
          include: { creator: { select: { name: true } } },
          take: LIMIT,
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),

    (activeTab === "all" || activeTab === "people")
      ? prisma.user.findMany({
          where: {
            role: "DONOR",
            OR: [{ name: contains }, { bio: contains }, { jobTitle: contains }, { company: contains }],
          },
          take: LIMIT,
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const totalCount = projects.length + ngos.length + roles.length + campaigns.length + people.length;

  const tabs: { key: Tab; label: string; count: number; icon: React.ElementType }[] = [
    { key: "all",       label: "All",       count: totalCount,        icon: Search },
    { key: "projects",  label: "Projects",  count: projects.length,   icon: FolderOpen },
    { key: "ngos",      label: "NGOs",      count: ngos.length,       icon: Building2 },
    { key: "roles",     label: "Roles",     count: roles.length,      icon: Briefcase },
    { key: "campaigns", label: "Campaigns", count: campaigns.length,  icon: Megaphone },
    { key: "people",    label: "People",    count: people.length,     icon: Users },
  ];

  return (
    <>
      <Navbar session={session} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Results for <span className="text-emerald-700">&ldquo;{query}&rdquo;</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {totalCount === 0 ? "No results found." : `${totalCount} result${totalCount !== 1 ? "s" : ""} across all categories`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap mb-7 border-b border-gray-100 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={tab.key === "all" ? `/search?q=${encodeURIComponent(query)}` : `/search?q=${encodeURIComponent(query)}&type=${tab.key}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {tab.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {totalCount === 0 ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-xs text-gray-400 mt-1">Try a different keyword — NGO name, skill, cause, or location.</p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Projects */}
            {projects.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5" /> Projects
                  </h2>
                  {activeTab === "all" && (
                    <Link href={`/search?q=${encodeURIComponent(query)}&type=projects`} className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5">
                      See all <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <div className="space-y-2">
                  {projects.map((p) => {
                    const pct = p.goalAmount > 0 ? Math.min(100, Math.round((p.raisedAmount / p.goalAmount) * 100)) : 0;
                    return (
                      <Link key={p.id} href={`/projects/${p.id}`}
                        className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {p.ngo.orgName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">{p.title}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{p.ngo.orgName} · {CATEGORY_LABELS[p.category] ?? p.category}</p>
                          {p.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[120px]">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-400">{pct}% funded</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* NGOs */}
            {ngos.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> NGOs
                  </h2>
                  {activeTab === "all" && (
                    <Link href={`/search?q=${encodeURIComponent(query)}&type=ngos`} className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5">
                      See all <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <div className="space-y-2">
                  {ngos.map((ngo) => (
                    <Link key={ngo.id} href={`/ngo/${ngo.id}`}
                      className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-teal-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {ngo.orgName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">{ngo.orgName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {ngo.state && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" /> {ngo.state}
                            </span>
                          )}
                          {ngo.trustScore > 0 && (
                            <span className="text-[11px] text-emerald-600 font-semibold">★ {ngo.trustScore.toFixed(1)}</span>
                          )}
                          <span className="text-[11px] text-gray-400">{ngo._count.projects} project{ngo._count.projects !== 1 ? "s" : ""}</span>
                        </div>
                        {ngo.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ngo.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Open Roles */}
            {roles.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Open Roles
                  </h2>
                  {activeTab === "all" && (
                    <Link href={`/search?q=${encodeURIComponent(query)}&type=roles`} className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5">
                      See all <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <div className="space-y-2">
                  {roles.map((role) => {
                    const isPaid = role.salaryMin != null || role.salaryMax != null;
                    const salaryLabel = isPaid
                      ? (role.salaryMin && role.salaryMax
                          ? `$${Math.round(role.salaryMin / 1000)}k–$${Math.round(role.salaryMax / 1000)}k/yr`
                          : role.salaryMin ? `From $${Math.round(role.salaryMin / 1000)}k/yr` : `Up to $${Math.round(role.salaryMax! / 1000)}k/yr`)
                      : null;
                    return (
                      <Link key={role.id} href={`/opportunities/${role.id}`}
                        className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">{role.title}</p>
                            {isPaid ? (
                              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">💰 Paid</span>
                            ) : (
                              <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">🤝 Volunteer</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{role.ngo.orgName}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {role.timeCommitment}</span>
                            <span className="flex items-center gap-0.5">
                              {role.isRemote ? <><Wifi className="w-3 h-3" /> Remote</> : <><MapPin className="w-3 h-3" /> {role.location ?? "On-site"}</>}
                            </span>
                            {salaryLabel && (
                              <span className="flex items-center gap-0.5 text-emerald-700 font-semibold">
                                <DollarSign className="w-3 h-3" /> {salaryLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Campaigns */}
            {campaigns.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5" /> Campaigns
                  </h2>
                  {activeTab === "all" && (
                    <Link href={`/search?q=${encodeURIComponent(query)}&type=campaigns`} className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5">
                      See all <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <div className="space-y-2">
                  {campaigns.map((c) => {
                    const isSkill = c.description?.includes("[SKILL CAMPAIGN]");
                    const pct = c.goalAmount && c.goalAmount > 0 && c.raisedAmount
                      ? Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100))
                      : 0;
                    return (
                      <Link key={c.id} href={`/campaigns/${c.id}`}
                        className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all group"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSkill ? "bg-violet-100 text-violet-700" : "bg-purple-100 text-purple-700"}`}>
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">{c.title}</p>
                            <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSkill ? "bg-violet-100 text-violet-700" : "bg-purple-100 text-purple-700"}`}>
                              {isSkill ? "Skill" : "Financial"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">by {c.creator.name ?? "Anonymous"}</p>
                          {!isSkill && c.goalAmount && c.goalAmount > 0 && (
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[120px]">
                                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[10px] text-gray-400">{pct}% of goal</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* People */}
            {people.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> People
                  </h2>
                  {activeTab === "all" && (
                    <Link href={`/search?q=${encodeURIComponent(query)}&type=people`} className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5">
                      See all <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <div className="space-y-2">
                  {people.map((person) => (
                    <Link key={person.id} href={`/donor/${person.id}/profile`}
                      className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all group"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {person.name ? person.name.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{person.name ?? "Anonymous"}</p>
                        {(person.jobTitle || person.company) && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {[person.jobTitle, person.company].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {person.city && (
                          <p className="text-[11px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-3 h-3" /> {person.city}
                          </p>
                        )}
                        {person.bio && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{person.bio}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </>
  );
}
