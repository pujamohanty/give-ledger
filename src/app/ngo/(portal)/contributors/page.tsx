import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Briefcase, ExternalLink, Users } from "lucide-react";

export default async function NgoContributorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tab: rawTab } = await searchParams;
  const tab = rawTab === "skill" ? "skill" : "financial";

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) redirect("/login");

  // ── Financial donors ──────────────────────────────────────────────────────
  const donations = await prisma.donation.findMany({
    where: { project: { ngoId: ngo.id } },
    include: {
      user: {
        select: { id: true, name: true, jobTitle: true, company: true },
      },
      project: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by donor
  const donorMap = new Map<
    string,
    {
      user: { id: string; name: string | null; jobTitle: string | null; company: string | null };
      totalDonated: number;
      projects: Set<string>;
      lastDonation: Date;
    }
  >();
  for (const d of donations) {
    const existing = donorMap.get(d.userId);
    if (existing) {
      existing.totalDonated += d.amount;
      existing.projects.add(d.project.title);
      if (new Date(d.createdAt) > existing.lastDonation) existing.lastDonation = new Date(d.createdAt);
    } else {
      donorMap.set(d.userId, {
        user: d.user,
        totalDonated: d.amount,
        projects: new Set([d.project.title]),
        lastDonation: new Date(d.createdAt),
      });
    }
  }
  const financialDonors = Array.from(donorMap.values()).sort((a, b) => b.totalDonated - a.totalDonated);

  // ── Skill contributors ───────────────────────────────────────────────────
  const skillContributions = await prisma.skillContribution.findMany({
    where: { ngoId: ngo.id, status: "APPROVED" },
    include: {
      donor: { select: { id: true, name: true, jobTitle: true, company: true } },
      project: { select: { title: true } },
    },
    orderBy: { approvedAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Our Contributors</h1>
        <p className="text-gray-500 text-sm mt-1">
          Everyone who has supported {ngo.orgName} — financially and through their skills.
        </p>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{financialDonors.length}</p>
              <p className="text-xs text-gray-500">Financial Donors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{skillContributions.length}</p>
              <p className="text-xs text-gray-500">Skill Contributors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <Link
          href="/ngo/contributors?tab=financial"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "financial" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Financial Donors
          <span className="ml-2 text-xs font-semibold text-gray-400">{financialDonors.length}</span>
        </Link>
        <Link
          href="/ngo/contributors?tab=skill"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "skill" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Skill Contributors
          <span className="ml-2 text-xs font-semibold text-gray-400">{skillContributions.length}</span>
        </Link>
      </div>

      {/* Financial Donors tab */}
      {tab === "financial" && (
        <Card>
          <CardContent className="p-0">
            {financialDonors.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No financial donations yet.</p>
                <p className="text-xs mt-1">Donors will appear here once they contribute to your projects.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {financialDonors.map(({ user, totalDonated, projects, lastDonation }) => (
                  <div key={user.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 font-semibold text-emerald-700 text-sm">
                        {user.name?.charAt(0).toUpperCase() ?? "D"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{user.name ?? "Anonymous"}</p>
                        {(user.jobTitle || user.company) && (
                          <p className="text-xs text-gray-500 truncate">
                            {[user.jobTitle, user.company].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {Array.from(projects).join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-emerald-700">{formatCurrency(totalDonated)}</p>
                      <p className="text-xs text-gray-400">{formatDate(lastDonation)}</p>
                      <Link
                        href={`/donor/${user.id}/profile`}
                        className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5 justify-end mt-1"
                      >
                        View profile <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Skill Contributors tab */}
      {tab === "skill" && (
        <Card>
          <CardContent className="p-0">
            {skillContributions.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No approved skill contributions yet.</p>
                <p className="text-xs mt-1">Verified skill contributors will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {skillContributions.map((c) => (
                  <div key={c.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0 font-semibold text-violet-700 text-sm">
                        {c.donor.name?.charAt(0).toUpperCase() ?? "C"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{c.donor.name ?? "Anonymous"}</p>
                        {(c.donor.jobTitle || c.donor.company) && (
                          <p className="text-xs text-gray-500 truncate">
                            {[c.donor.jobTitle, c.donor.company].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-medium text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded-full">
                            {c.skillCategory}
                          </span>
                          {c.project && (
                            <span className="text-xs text-gray-400 truncate">{c.project.title}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {c.hoursContributed != null && (
                        <p className="text-sm font-bold text-gray-900">{c.hoursContributed}h</p>
                      )}
                      {c.monetaryValue != null && (
                        <p className="text-xs text-violet-700 font-semibold">{formatCurrency(c.monetaryValue)}</p>
                      )}
                      <p className="text-xs text-gray-400">{formatDate(c.approvedAt ?? c.submittedAt)}</p>
                      <Link
                        href={`/donor/${c.donorId}/profile`}
                        className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5 justify-end mt-1"
                      >
                        View profile <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
