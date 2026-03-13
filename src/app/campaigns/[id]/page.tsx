import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Users, Clock, ExternalLink, CheckCircle2, Target,
} from "lucide-react";
import ShareMilestoneCard from "@/components/ShareMilestoneCard";
import ShareCampaignButton from "./ShareCampaignButton";

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
  "c2": {
    id: "c2",
    title: "Complete Cohort 2 vocational training in Bihar",
    creator: "Anjali P.",
    creatorInitial: "AP",
    project: "Livelihood Training - Rural Bihar",
    projectId: "2",
    ngo: "Pragati Foundation",
    goal: 12000,
    raised: 8400,
    contributors: 41,
    daysLeft: 18,
    description: "I grew up in rural Bihar. I know what unemployment does to families — especially women. Then I discovered Pragati Foundation and saw what they've built.\n\nCohort 1 was remarkable. 45 women trained, certified, and each given a starter kit. Seven of them have already started businesses within 30 days. That's not a statistic — that's a family transformed.\n\nCohort 2 needs $12,000 to run the same programme for the next 45 women. The money is milestone-locked — Pragati only receives it once attendance, certifications, and starter kit distribution are verified and recorded on-chain.\n\nI'm asking my network to help finish what Cohort 1 started.",
    completedMilestones: [
      { name: "Training centre setup", metric: "Training facility set up across 3 villages", milestoneId: "m3", txHash: "0x2c1d3e4f..." },
      { name: "Cohort 1 — 45 women trained", metric: "45 women certified, 7 businesses started within 30 days", milestoneId: "m2", txHash: "0x9a8b7c6d..." },
    ],
    contributors_list: [
      { name: "Priya S.", amount: 1000, time: "1h ago" },
      { name: "Anonymous", amount: 250, time: "4h ago" },
      { name: "Vikram S.", amount: 500, time: "1d ago" },
      { name: "Fatima A.", amount: 200, time: "2d ago" },
      { name: "Anonymous", amount: 150, time: "3d ago" },
    ],
    category: "Income Generation",
  },
  "c3": {
    id: "c3",
    title: "50 seniors deserve a proper home — help finish the build",
    creator: "David L.",
    creatorInitial: "DL",
    project: "Elderly Care Home - Mysore",
    projectId: "3",
    ngo: "SilverYears Trust",
    goal: 18000,
    raised: 11200,
    contributors: 78,
    daysLeft: 8,
    description: "I visited a government shelter home in Mysore two years ago. What I saw broke me. Forty elders in a room built for fifteen, no medical care, no dignity.\n\nThen I found SilverYears Trust. Dr. Meera Nair has been fighting for these elders for 12 years. The land is acquired. The foundation is poured. The walls are up. 60% of a proper 50-bed facility is already structurally complete.\n\nNow they're stuck at the roof, electrical, and plumbing phase — $18,000 away from a facility that can open its doors to 50 seniors who have nowhere else to go.\n\nThis campaign closes in 8 days. Every single rupee is milestone-locked on the blockchain. SilverYears doesn't get the money until a licensed architect certifies each phase is complete. Help me get this over the line.",
    completedMilestones: [
      { name: "Land acquisition & permits", metric: "Land acquired, all permits obtained from BBMP", milestoneId: "m4", txHash: "0x5b4c3d2e..." },
      { name: "Foundation & ground floor structure", metric: "60% of 50-bed facility now structurally complete", milestoneId: "m5", txHash: "0x1a2b3c4d..." },
    ],
    contributors_list: [
      { name: "Meena R.", amount: 2000, time: "3h ago" },
      { name: "Anonymous", amount: 500, time: "5h ago" },
      { name: "Rahul M.", amount: 300, time: "1d ago" },
      { name: "Anjali P.", amount: 1000, time: "1d ago" },
      { name: "Anonymous", amount: 250, time: "2d ago" },
    ],
    category: "Elderly Care",
  },
  "c4": {
    id: "c4",
    title: "Solar power for 3 more Ugandan schools",
    creator: "Marcus T.",
    creatorInitial: "MT",
    project: "Solar Microgrids for Rural Schools",
    projectId: "6",
    ngo: "SunPower Africa",
    goal: 15000,
    raised: 4100,
    contributors: 19,
    daysLeft: 25,
    description: "I run a small energy consultancy and when I saw what SunPower Africa built in Uganda, I had to get involved.\n\nPhase 1 is done — 3 schools, 860 students, evening study hours restored, $1,200 per month in diesel costs eliminated. The evidence is all on-chain. Electrical engineer sign-off, power readings, photos. It's verifiable.\n\nPhase 2 covers the remaining 3 schools. Same methodology. Same transparency. 15,000 dollars to give another ~860 students the same outcome.\n\nI've contributed personally. Now I'm asking my network to help me close this out. Every contribution goes to a milestone-locked fund — SunPower Africa gets nothing until the installations are certified complete.",
    completedMilestones: [
      { name: "Equipment procurement & shipping", metric: "Solar panels and batteries shipped and customs-cleared", milestoneId: "m7", txHash: "0x3e4f5a6b..." },
      { name: "Installation — Schools 1–3", metric: "860 students have evening study hours, monthly savings $600", milestoneId: "m8", txHash: "0xf1e2d3c4..." },
    ],
    contributors_list: [
      { name: "Aisha B.", amount: 500, time: "2h ago" },
      { name: "Anonymous", amount: 100, time: "6h ago" },
      { name: "James O.", amount: 300, time: "1d ago" },
      { name: "Priya S.", amount: 200, time: "2d ago" },
      { name: "Anonymous", amount: 150, time: "3d ago" },
    ],
    category: "Education",
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
                <ShareCampaignButton campaignId={campaign.id} title={campaign.title} />

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
