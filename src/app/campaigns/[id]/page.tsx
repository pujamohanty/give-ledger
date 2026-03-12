import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Users, Clock, Share2, ExternalLink, CheckCircle2, Gift, Target,
} from "lucide-react";
import ShareMilestoneCard from "@/components/ShareMilestoneCard";

const campaigns = {
  "c1": {
    id: "c1",
    title: "Help fund the last 6 Kibera school installations",
    creator: "Sarah K.",
    creatorInitial: "SK",
    project: "Clean Water for Kibera Schools",
    projectId: "1",
    ngo: "WaterBridge Kenya",
    goal: 7500,
    raised: 3200,
    contributors: 24,
    daysLeft: 12,
    description: "I donated to this project and witnessed how clean water changed these children's lives. Cohort 1 installations are done — 2,400 kids have clean water every day now. The final 6 schools are next.\n\nWe need $7,500 to complete installations at Schools 7–12. That's roughly $1,250 per school. Every dollar is milestone-locked — WaterBridge Kenya receives funds only when the school principal and a water quality lab certify the installation is complete.\n\nThis is transparent giving at its best. Join me.",
    completedMilestones: [
      { name: "Installation — Schools 1–6", metric: "2,400 children now have clean water", milestoneId: "m1", txHash: "0x7d6e5f4c..." },
    ],
    contributors_list: [
      { name: "Rahul M.", amount: 200, time: "2h ago" },
      { name: "Priya S.", amount: 500, time: "1d ago" },
      { name: "Anonymous", amount: 100, time: "1d ago" },
      { name: "James O.", amount: 250, time: "2d ago" },
      { name: "Aisha B.", amount: 150, time: "3d ago" },
    ],
    category: "Child Care",
  },
};

export function generateStaticParams() {
  return Object.keys(campaigns).map((id) => ({ id }));
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = campaigns[id as keyof typeof campaigns];
  const session = await auth();

  if (!campaign) return notFound();

  const pct = Math.round((campaign.raised / campaign.goal) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> All Campaigns
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign header */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {campaign.category}
                  </span>
                  <span className="text-xs text-gray-400">Donor Campaign</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{campaign.title}</h1>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {campaign.creatorInitial}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Campaign by {campaign.creator}</p>
                    <p className="text-xs text-gray-500">For: {campaign.ngo} · {campaign.project}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-gray-900 text-lg">${campaign.raised.toLocaleString()}</span>
                    <span className="text-gray-400">of ${campaign.goal.toLocaleString()} · {pct}%</span>
                  </div>
                  <Progress value={pct} />
                </div>

                <div className="flex items-center gap-5 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" />{campaign.contributors} contributors</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{campaign.daysLeft} days left</span>
                </div>
              </CardContent>
            </Card>

            {/* Why I'm running this */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="font-bold text-gray-900 mb-4">Why {campaign.creator} is running this</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{campaign.description}</p>
              </CardContent>
            </Card>

            {/* Verified milestones on this project */}
            {campaign.completedMilestones.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="font-bold text-gray-900 mb-4">What's Already Been Achieved</h2>
                  <p className="text-sm text-gray-500 mb-4">These milestones are verified on-chain. Your contribution funds the next ones.</p>
                  <div className="space-y-4">
                    {campaign.completedMilestones.map((m) => (
                      <div key={m.name} className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-emerald-900 text-sm">{m.name}</p>
                          <p className="text-sm text-emerald-700 mt-1">{m.metric}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <a
                              href={`https://polygonscan.com/tx/${m.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-emerald-600"
                            >
                              {m.txHash} <ExternalLink className="w-3 h-3" />
                            </a>
                            <ShareMilestoneCard
                              milestoneId={m.milestoneId}
                              milestoneName={m.name}
                              projectTitle={campaign.project}
                              ngoName={campaign.ngo}
                              metric={m.metric}
                              txHash={m.txHash}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent contributors */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h2 className="font-bold text-gray-900 mb-4">Recent Contributors</h2>
                <div className="space-y-3">
                  {campaign.contributors_list.map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                          {c.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.time}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-emerald-700">${c.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-sm sticky top-24">
              <CardContent className="p-5">
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900">${campaign.raised.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">raised of ${campaign.goal.toLocaleString()} goal</p>
                </div>
                <Progress value={pct} className="mb-4" />

                <Link href={`/projects/${campaign.projectId}`}>
                  <Button size="lg" className="w-full mb-3">Contribute to This Campaign</Button>
                </Link>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Share2 className="w-4 h-4" />
                  Share This Campaign
                </Button>

                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    Contributions go directly to the project — milestone-locked. 100% traceable on-chain.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
              <Target className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{campaign.project}</p>
                <Link href={`/projects/${campaign.projectId}`} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                  View full project <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
