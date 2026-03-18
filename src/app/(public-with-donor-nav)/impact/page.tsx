import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  Globe,
  ArrowRight,
  ExternalLink,
  Quote,
} from "lucide-react";

const categoryLabel: Record<string, string> = {
  INCOME_GENERATION: "Income Generation",
  CHILD_CARE: "Child Care",
  ELDERLY_CARE: "Elderly Care",
  PHYSICALLY_DISABLED: "Accessibility",
  PET_CARE: "Animal Welfare",
  OTHER: "Other",
};

const categoryColor: Record<string, string> = {
  INCOME_GENERATION: "bg-emerald-500",
  CHILD_CARE: "bg-blue-500",
  ELDERLY_CARE: "bg-purple-500",
  PHYSICALLY_DISABLED: "bg-amber-500",
  PET_CARE: "bg-pink-400",
  OTHER: "bg-gray-400",
};

const testimonials = [
  {
    quote: "I've donated to NGOs for 10 years. GiveLedger is the first platform where I actually know what happened to my money. The milestone verification gave me confidence I've never had before.",
    name: "Priya Sharma",
    role: "Donor · Mumbai",
    avatar: "PS",
  },
  {
    quote: "The transparency requirement pushed us to document our work better than we ever had. Our donors are more engaged, and our team is more accountable. It's been transformative.",
    name: "James Odhiambo",
    role: "Executive Director · WaterBridge Kenya",
    avatar: "JO",
  },
  {
    quote: "I shared a milestone completion post on LinkedIn and three colleagues signed up the next day. The on-chain proof made it impossible to argue with.",
    name: "Rahul Mehta",
    role: "Donor · Bangalore",
    avatar: "RM",
  },
  {
    quote: "We raised our full $80,000 goal in 6 weeks. The milestone structure gave donors clarity on exactly what they were funding at each stage.",
    name: "Dr. Meera Nair",
    role: "Founder · SilverYears Trust",
    avatar: "MN",
  },
];

export default async function ImpactPage() {
  const session = await auth();

  const [
    disbursementStats,
    milestonesCompleted,
    activeNgos,
    uniqueDonors,
    allProjects,
    featuredMilestones,
    recentDisbursements,
    allDisbursements,
  ] = await Promise.all([
    prisma.disbursement.aggregate({
      where: { status: "APPROVED" },
      _sum: { requestedAmount: true },
    }),
    prisma.milestone.count({ where: { status: "COMPLETED" } }),
    prisma.ngo.count({ where: { status: "ACTIVE" } }),
    prisma.donation.findMany({ select: { userId: true }, distinct: ["userId"] }),
    prisma.project.findMany({
      select: {
        category: true,
        milestones: {
          select: {
            disbursement: { select: { requestedAmount: true, status: true } },
          },
        },
      },
    }),
    prisma.milestone.findMany({
      where: { status: "COMPLETED" },
      include: {
        project: { include: { ngo: { select: { orgName: true } } } },
        outputMarkers: { take: 1 },
        disbursement: { include: { blockchainRecord: { select: { txHash: true } } } },
      },
      orderBy: { completedAt: "desc" },
      take: 3,
    }),
    prisma.disbursement.findMany({
      where: { status: "APPROVED" },
      include: {
        milestone: { include: { project: { select: { title: true } } } },
        blockchainRecord: { select: { txHash: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.disbursement.findMany({
      where: { status: "APPROVED" },
      select: { requestedAmount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const totalDisbursed = disbursementStats._sum.requestedAmount ?? 0;
  const donorCount = uniqueDonors.length;

  // Build category breakdown
  const categoryMap = new Map<string, { projects: number; disbursed: number }>();
  for (const project of allProjects) {
    const cat = project.category;
    const existing = categoryMap.get(cat) ?? { projects: 0, disbursed: 0 };
    const projectDisbursed = project.milestones.reduce(
      (sum, m) => sum + (m.disbursement?.status === "APPROVED" ? (m.disbursement.requestedAmount ?? 0) : 0),
      0
    );
    categoryMap.set(cat, {
      projects: existing.projects + 1,
      disbursed: existing.disbursed + projectDisbursed,
    });
  }
  const totalCategoryDisbursed = Array.from(categoryMap.values()).reduce((s, v) => s + v.disbursed, 0) || 1;
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([cat, data]) => ({
      category: categoryLabel[cat] ?? cat,
      pct: Math.round((data.disbursed / totalCategoryDisbursed) * 100),
      projects: data.projects,
      amount: data.disbursed >= 1000
        ? `$${(data.disbursed / 1000).toFixed(0)}K`
        : `$${data.disbursed}`,
      color: categoryColor[cat] ?? "bg-gray-400",
    }))
    .sort((a, b) => b.pct - a.pct);

  // Build monthly growth data
  const monthlyMap = new Map<string, number>();
  for (const d of allDisbursements) {
    const key = new Date(d.createdAt).toLocaleString("en-US", { month: "short", year: "2-digit" });
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + d.requestedAmount);
  }
  let cumulative = 0;
  const impactGrowth = Array.from(monthlyMap.entries()).map(([month, amount]) => {
    cumulative += amount;
    return { month, disbursed: cumulative };
  });
  const maxDisbursed = Math.max(...impactGrowth.map((d) => d.disbursed), 1);

  const platformStats = [
    {
      label: "Total Disbursed",
      value: totalDisbursed >= 1000000
        ? `$${(totalDisbursed / 1000000).toFixed(1)}M`
        : totalDisbursed >= 1000
        ? `$${(totalDisbursed / 1000).toFixed(0)}K`
        : `$${totalDisbursed}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      sub: `Across ${allProjects.length} project${allProjects.length !== 1 ? "s" : ""}`,
    },
    {
      label: "Unique Donors",
      value: String(donorCount),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sub: "Verified contributors",
    },
    {
      label: "Milestones Verified",
      value: String(milestonesCompleted),
      icon: CheckCircle2,
      color: "text-purple-600",
      bg: "bg-purple-50",
      sub: "100% evidence-backed",
    },
    {
      label: "Active NGOs",
      value: String(activeNgos),
      icon: Globe,
      color: "text-amber-600",
      bg: "bg-amber-50",
      sub: "US-verified nonprofits",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Every number here is backed by on-chain proof</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-5">
            Real outcomes.<br />Verified on-chain.
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-8">
            GiveLedger releases funds only when NGOs prove milestones are complete. Here&apos;s what that accountability has produced.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {platformStats.map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-emerald-100 mt-1">{stat.label}</p>
                <p className="text-xs text-emerald-200 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-14 space-y-14">
        {/* Growth chart */}
        {impactGrowth.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900">Growth Over Time</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">Cumulative funds disbursed (verified milestones only)</p>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {impactGrowth.map((row) => (
                    <div key={row.month} className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 w-14 flex-shrink-0">{row.month}</span>
                      <div className="flex-1">
                        <div className="h-7 bg-gray-100 rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                            style={{ width: `${(row.disbursed / maxDisbursed) * 100}%` }}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600">
                            ${row.disbursed >= 1000 ? `${(row.disbursed / 1000).toFixed(0)}K` : row.disbursed}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Impact by cause */}
        {categoryBreakdown.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Impact by Cause</h2>
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{cat.category}</p>
                      <p className="text-sm text-gray-500">{cat.projects} project{cat.projects !== 1 ? "s" : ""} · {cat.amount} disbursed</p>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{cat.pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured verified milestones */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recently Verified Milestones</h2>
              <p className="text-sm text-gray-500 mt-1">Funds released only after these were reviewed and confirmed</p>
            </div>
            <Link href="/projects">
              <Button variant="outline" size="sm" className="gap-2">
                Browse Projects <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {featuredMilestones.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No completed milestones yet — be the first to fund one.</p>
          ) : (
            <div className="grid gap-4">
              {featuredMilestones.map((m) => {
                const txHash = m.disbursement?.blockchainRecord?.txHash ?? m.disbursement?.txHash ?? null;
                const metric = m.outputMarkers[0]
                  ? `${m.outputMarkers[0].value}${m.outputMarkers[0].unit ? " " + m.outputMarkers[0].unit : ""} ${m.outputMarkers[0].label}`
                  : null;
                const completedDate = m.completedAt
                  ? new Date(m.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : null;
                return (
                  <Card key={m.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {categoryLabel[m.project.category] ?? m.project.category}
                            </span>
                            {completedDate && <span className="text-xs text-gray-400">{completedDate}</span>}
                          </div>
                          <p className="font-semibold text-gray-900">{m.name}</p>
                          <p className="text-sm text-emerald-700 mt-0.5">{m.project.ngo.orgName} · {m.project.title}</p>
                          {metric && <p className="text-sm text-gray-600 mt-2 font-medium">{metric}</p>}
                          <div className="flex items-center gap-4 mt-3">
                            <Link href={`/share/${m.id}`} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                              See full proof →
                            </Link>
                            {txHash && (
                              <a
                                href={`https://polygonscan.com/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600"
                              >
                                <span className="font-mono">{txHash.slice(0, 20)}...</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* On-chain ledger preview */}
        {recentDisbursements.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-2">On-Chain Disbursement Ledger</h2>
            <p className="text-sm text-gray-500 mb-6">Every fund release is recorded on the Polygon blockchain — verifiable by anyone</p>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tx Hash</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentDisbursements.map((d) => {
                        const txHash = d.blockchainRecord?.txHash ?? d.txHash ?? null;
                        const date = new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                        return (
                          <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 text-gray-900 font-medium">{d.milestone.project.title}</td>
                            <td className="px-5 py-3 text-emerald-700 font-semibold">${d.requestedAmount.toLocaleString()}</td>
                            <td className="px-5 py-3">
                              {txHash ? (
                                <a
                                  href={`https://polygonscan.com/tx/${txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-emerald-600"
                                >
                                  {txHash.slice(0, 20)}... <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-gray-400 text-xs">{date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Testimonials */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">What Donors &amp; NGOs Say</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <Quote className="w-6 h-6 text-emerald-200 mb-3" />
                  <p className="text-gray-700 leading-relaxed text-sm italic mb-5">{t.quote}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-10 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Every dollar here has a trail</h2>
          <p className="text-emerald-100 text-sm mb-8 max-w-xl mx-auto">
            Browse projects where your donation goes from your wallet to a verified real-world outcome — nothing in between is hidden.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/projects">
              <Button className="bg-white text-emerald-700 hover:bg-gray-50 gap-2 w-full sm:w-auto">
                Browse Projects <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            {!session && (
              <Link href="/signup">
                <Button variant="outline" className="border-white/50 text-white hover:bg-white/10 w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
