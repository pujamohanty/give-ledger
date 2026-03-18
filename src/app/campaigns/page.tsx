import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gift, Users, Clock, ArrowRight, Plus, Target, Briefcase, DollarSign, Wifi, MapPin } from "lucide-react";

const categoryColors: Record<string, string> = {
  CHILD_CARE:           "bg-blue-100 text-blue-700",
  INCOME_GENERATION:    "bg-emerald-100 text-emerald-700",
  ELDERLY_CARE:         "bg-purple-100 text-purple-700",
  PHYSICALLY_DISABLED:  "bg-amber-100 text-amber-700",
  PET_CARE:             "bg-pink-100 text-pink-700",
  OTHER:                "bg-gray-100 text-gray-600",
};

const categoryLabel: Record<string, string> = {
  CHILD_CARE:          "Child Care",
  INCOME_GENERATION:   "Income Generation",
  ELDERLY_CARE:        "Elderly Care",
  PHYSICALLY_DISABLED: "Accessibility",
  PET_CARE:            "Animal Welfare",
  OTHER:               "Other",
};

const roleTypeLabels: Record<string, string> = {
  INTERNSHIP:        "Internship",
  CAREER_TRANSITION: "Career Transition",
  INTERIM:           "Interim Role",
  VOLUNTEER:         "Volunteer",
};

/** Parse a campaign's description to detect type and extract embedded role IDs */
function parseCampaign(description: string | null) {
  const raw = description ?? "";
  const isSkill = raw.startsWith("[SKILL CAMPAIGN]");
  const roleMatch = raw.match(/Open roles: ([\w,]+)/);
  const roleIds = roleMatch ? roleMatch[1].split(",").filter(Boolean) : [];
  const userText = isSkill
    ? raw.replace("[SKILL CAMPAIGN]", "").replace(/\n\nOpen roles:.*/, "").trim()
    : raw;
  return { isSkill, roleIds, userText };
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  const { type } = await searchParams;
  const activeTab = type === "skill" ? "skill" : type === "financial" ? "financial" : "all";

  const allCampaigns = await prisma.campaign.findMany({
    include: {
      creator: { select: { id: true, name: true } },
      project: {
        select: {
          id: true,
          title: true,
          category: true,
          ngo: { select: { id: true, orgName: true } },
        },
      },
      contributors: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  // Annotate with parsed type info
  const annotated = allCampaigns.map((c) => ({
    ...c,
    ...parseCampaign(c.description),
  }));

  // Collect all role IDs from skill campaigns
  const allRoleIds = [...new Set(annotated.flatMap((c) => c.roleIds))];
  const rolesMap: Record<string, { id: string; title: string; roleType: string; timeCommitment: string; durationWeeks: number; isRemote: boolean }> = {};
  if (allRoleIds.length > 0) {
    const roles = await prisma.ngoRole.findMany({
      where: { id: { in: allRoleIds } },
      select: { id: true, title: true, roleType: true, timeCommitment: true, durationWeeks: true, isRemote: true },
    });
    roles.forEach((r) => { rolesMap[r.id] = r; });
  }

  // Apply tab filter
  const campaigns = annotated.filter((c) => {
    if (activeTab === "skill")     return c.isSkill;
    if (activeTab === "financial") return !c.isSkill;
    return true;
  });

  const financialCount = annotated.filter((c) => !c.isSkill).length;
  const skillCount     = annotated.filter((c) => c.isSkill).length;
  const totalRaised    = annotated.filter((c) => !c.isSkill).reduce((s, c) => s + c.raisedAmount, 0);
  const totalSkillValue = annotated.filter((c) => c.isSkill).reduce((s, c) => s + c.goalAmount, 0);

  const now = Date.now();

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />

      {/* Header */}
      <section className="bg-white border-b border-[rgba(0,0,0,0.08)] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaigns by Donors</h1>
              <p className="text-gray-500 text-sm mt-1 max-w-xl">
                Donors mobilise their networks — through money or professional skills. Both count equally on GiveLedger.
              </p>
            </div>
            {session && (
              <Link href="/donor/campaigns/new" className="shrink-0">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Start Campaign
                </Button>
              </Link>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="bg-[#f3f2ef] rounded-lg px-4 py-2.5 text-center">
              <p className="text-lg font-bold text-gray-900">{financialCount}</p>
              <p className="text-xs text-gray-500">Financial campaigns</p>
            </div>
            <div className="bg-[#f3f2ef] rounded-lg px-4 py-2.5 text-center">
              <p className="text-lg font-bold text-gray-900">${totalRaised.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Raised via campaigns</p>
            </div>
            <div className="bg-[#f3f2ef] rounded-lg px-4 py-2.5 text-center">
              <p className="text-lg font-bold text-violet-700">{skillCount}</p>
              <p className="text-xs text-gray-500">Skill campaigns</p>
            </div>
            <div className="bg-[#f3f2ef] rounded-lg px-4 py-2.5 text-center">
              <p className="text-lg font-bold text-violet-700">${totalSkillValue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Skill value mobilised</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {[
              { key: "all",       label: "All campaigns",        count: annotated.length },
              { key: "financial", label: "Financial",            count: financialCount },
              { key: "skill",     label: "Skill Mobilisation",   count: skillCount },
            ].map((tab) => (
              <Link
                key={tab.key}
                href={tab.key === "all" ? "/campaigns" : `/campaigns?type=${tab.key}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20" : "bg-gray-100"}`}>
                  {tab.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {!session && (
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-lg px-5 py-4 mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-700">Log in to start your own campaign — financial or skill-based</p>
            <Link href="/login">
              <Button size="sm" className="shrink-0">Log in to start</Button>
            </Link>
          </div>
        )}

        {/* Skill campaigns explainer — show when on skill tab or mixed */}
        {(activeTab === "skill" || (activeTab === "all" && skillCount > 0)) && (
          <div className="bg-violet-50 border border-violet-100 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
            <Briefcase className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-violet-700 leading-relaxed">
              <span className="font-semibold">Skill Mobilisation campaigns</span> invite professionals to contribute their expertise to NGO roles.
              Contributions are verified, assigned a monetary value, and recorded on the contributor's GiveLedger credential — equivalent to paid professional experience.
            </p>
          </div>
        )}

        {campaigns.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {activeTab === "skill" ? <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" /> : <Gift className="w-10 h-10 mx-auto mb-3 opacity-30" />}
            <p className="text-sm">No {activeTab === "all" ? "" : activeTab + " "}campaigns yet.</p>
            {session && (
              <Link href="/donor/campaigns/new" className="mt-4 inline-block">
                <Button size="sm">Start a Campaign</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((c) => {
              const pct = c.goalAmount > 0 ? Math.min(100, Math.round((c.raisedAmount / c.goalAmount) * 100)) : 0;
              const daysLeft = c.endsAt
                ? Math.max(0, Math.floor((new Date(c.endsAt).getTime() - now) / (1000 * 60 * 60 * 24)))
                : null;
              const catLabel = categoryLabel[c.project.category] ?? c.project.category;
              const catColor = categoryColors[c.project.category] ?? "bg-gray-100 text-gray-600";
              const roles = c.roleIds.map((id) => rolesMap[id]).filter(Boolean);

              if (c.isSkill) {
                // ── Skill campaign card ────────────────────────────────────
                return (
                  <Card key={c.id} className="border-violet-100">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                          <Briefcase className="w-5 h-5 text-violet-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                  Skill Campaign
                                </span>
                                <Link href={`/projects?category=${c.project.category}`} className={`text-xs font-semibold px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity ${catColor}`}>
                                  {catLabel}
                                </Link>
                              </div>
                              <Link href={`/campaigns/${c.id}`} className="font-semibold text-gray-900 leading-snug hover:underline">
                                {c.title}
                              </Link>
                              <p className="text-sm text-gray-500 mt-0.5">
                                by{" "}
                                <Link href={`/donor/${c.creator.id}/profile`} className="font-medium text-gray-700 hover:underline">
                                  {c.creator.name ?? "Anonymous"}
                                </Link>
                                {" · "}
                                <Link href={`/ngo/${c.project.ngo.id}`} className="font-medium text-gray-700 hover:underline">
                                  {c.project.ngo.orgName}
                                </Link>
                              </p>
                              {c.userText && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.userText}</p>
                              )}
                            </div>
                            <Link href={`/campaigns/${c.id}`} className="shrink-0">
                              <Button variant="outline" size="sm" className="gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50">
                                View <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>

                          {/* Skill value bar */}
                          <div className="mt-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-violet-700 flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" /> Skill value target
                              </span>
                              <span className="text-sm font-bold text-violet-900">${c.goalAmount.toLocaleString()}</span>
                            </div>
                            {roles.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {roles.map((role) => (
                                  <Link
                                    key={role.id}
                                    href={`/opportunities/${role.id}`}
                                    className="flex items-center gap-1.5 bg-white border border-violet-200 hover:border-violet-400 rounded-lg px-2.5 py-1 transition-colors group"
                                  >
                                    <span className="text-[10px] font-semibold text-violet-700">{role.title}</span>
                                    <span className="text-[10px] text-gray-400">·</span>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                      {role.isRemote ? <Wifi className="w-2.5 h-2.5" /> : <MapPin className="w-2.5 h-2.5" />}
                                      {role.isRemote ? "Remote" : "On-site"}
                                    </span>
                                    <span className="text-[10px] text-violet-400 group-hover:text-violet-600">→</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-5 mt-2.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" /> {c.contributors.length} joined
                            </span>
                            {daysLeft !== null && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {daysLeft} days left
                              </span>
                            )}
                            <Link href={`/projects/${c.project.id}`} className="flex items-center gap-1 text-emerald-600 hover:underline">
                              View Project <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              // ── Financial campaign card ──────────────────────────────────
              return (
                <Card key={c.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Financial
                              </span>
                              <Link href={`/projects?category=${c.project.category}`} className={`text-xs font-semibold px-2 py-0.5 rounded-full hover:opacity-80 transition-opacity ${catColor}`}>
                                {catLabel}
                              </Link>
                            </div>
                            <Link href={`/campaigns/${c.id}`} className="font-semibold text-gray-900 leading-snug hover:underline">
                              {c.title}
                            </Link>
                            <p className="text-sm text-gray-500 mt-0.5">
                              by{" "}
                              <Link href={`/donor/${c.creator.id}/profile`} className="font-medium text-gray-700 hover:underline">
                                {c.creator.name ?? "Anonymous"}
                              </Link>
                              {" · "}
                              <Link href={`/ngo/${c.project.ngo.id}`} className="font-medium text-gray-700 hover:underline">
                                {c.project.ngo.orgName}
                              </Link>
                            </p>
                            {c.description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.description}</p>
                            )}
                          </div>
                          <Link href={`/campaigns/${c.id}`} className="shrink-0">
                            <Button variant="outline" size="sm" className="gap-1.5">
                              View <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-bold text-gray-900 flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                              ${c.raisedAmount.toLocaleString()}
                            </span>
                            <span className="text-gray-400">of ${c.goalAmount.toLocaleString()} · {pct}%</span>
                          </div>
                          <Progress value={pct} />
                        </div>

                        <div className="flex items-center gap-5 mt-2.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {c.contributors.length} contributors
                          </span>
                          {daysLeft !== null && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {daysLeft} days left
                            </span>
                          )}
                          <Link href={`/projects/${c.project.id}`} className="flex items-center gap-1 text-emerald-600 hover:underline">
                            View Project <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
