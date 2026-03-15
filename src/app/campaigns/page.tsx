import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gift, Users, Clock, ArrowRight, Plus, Target } from "lucide-react";

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

export default async function CampaignsPage() {
  const session = await auth();

  const campaigns = await prisma.campaign.findMany({
    include: {
      creator: { select: { name: true } },
      project: {
        select: {
          id: true,
          title: true,
          category: true,
          ngo: { select: { orgName: true } },
        },
      },
      contributors: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const now = Date.now();

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />

      {/* Header */}
      <section className="bg-white border-b border-[rgba(0,0,0,0.08)] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gift className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-purple-700">Donor Fundraising Campaigns</span>
          </div>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaigns by Donors</h1>
              <p className="text-gray-500 text-sm mt-1 max-w-xl">
                Donors create campaigns around projects they believe in — every campaign links to a verified, milestone-locked project.
              </p>
            </div>
            {session && (
              <Link href="/campaigns/new" className="shrink-0">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Start Campaign
                </Button>
              </Link>
            )}
          </div>
          <div className="flex gap-4 mt-6">
            <div className="bg-[#f3f2ef] rounded-lg px-4 py-2 text-center">
              <p className="text-lg font-bold text-gray-900">{campaigns.length}</p>
              <p className="text-xs text-gray-500">Active campaigns</p>
            </div>
            <div className="bg-[#f3f2ef] rounded-lg px-4 py-2 text-center">
              <p className="text-lg font-bold text-gray-900">
                ${campaigns.reduce((s, c) => s + c.raisedAmount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Raised via campaigns</p>
            </div>
            <div className="bg-[#f3f2ef] rounded-lg px-4 py-2 text-center">
              <p className="text-lg font-bold text-gray-900">
                {campaigns.reduce((s, c) => s + c.contributors.length, 0)}
              </p>
              <p className="text-xs text-gray-500">Contributors</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {!session && (
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-lg px-5 py-4 mb-6 flex items-center justify-between gap-4 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
            <p className="text-sm text-gray-700">Log in to start your own campaign around a project you support</p>
            <Link href="/login">
              <Button size="sm" className="shrink-0">Log in to start</Button>
            </Link>
          </div>
        )}

        {campaigns.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Gift className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No campaigns yet. Be the first to start one!</p>
            {session && (
              <Link href="/campaigns/new" className="mt-4 inline-block">
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
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${catColor}`}>
                                {catLabel}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 leading-snug">{c.title}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">
                              by {c.creator.name ?? "Anonymous"} · {c.project.ngo.orgName}
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
                            <span className="font-bold text-gray-900">${c.raisedAmount.toLocaleString()}</span>
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
                          <Link
                            href={`/projects/${c.project.id}`}
                            className="flex items-center gap-1 text-emerald-600 hover:underline"
                          >
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
