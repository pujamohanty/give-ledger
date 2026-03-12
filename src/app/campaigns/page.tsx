import Link from "next/link";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Gift, Users, Clock, ArrowRight, Plus, Target } from "lucide-react";

const campaigns = [
  {
    id: "c1",
    title: "Help fund the last 6 Kibera school installations",
    creator: "Sarah K.",
    project: "Clean Water for Kibera Schools",
    ngo: "WaterBridge Kenya",
    goal: 7500,
    raised: 3200,
    contributors: 24,
    daysLeft: 12,
    description: "I donated to this project and witnessed how clean water changed these children's lives. Let's push this project to the finish line together.",
    category: "Child Care",
  },
  {
    id: "c2",
    title: "Complete Cohort 2 vocational training in Bihar",
    creator: "Anjali P.",
    project: "Livelihood Training - Rural Bihar",
    ngo: "Pragati Foundation",
    goal: 12000,
    raised: 8400,
    contributors: 41,
    daysLeft: 18,
    description: "Cohort 1 was transformative — 45 women certified, 7 businesses started. Help us get the next 45 women through the same programme.",
    category: "Income Generation",
  },
  {
    id: "c3",
    title: "50 seniors deserve a proper home — help finish the build",
    creator: "David L.",
    project: "Elderly Care Home - Mysore",
    ngo: "SilverYears Trust",
    goal: 18000,
    raised: 11200,
    contributors: 78,
    daysLeft: 8,
    description: "The foundation is done, walls are up. Help SilverYears Trust complete the roof and electrical work so this home can open its doors.",
    category: "Elderly Care",
  },
  {
    id: "c4",
    title: "Solar power for 3 more Ugandan schools",
    creator: "Marcus T.",
    project: "Solar Microgrids for Rural Schools",
    ngo: "SunPower Africa",
    goal: 15000,
    raised: 4100,
    contributors: 19,
    daysLeft: 25,
    description: "Phase 1 lit up 3 schools. Now let's do the same for the remaining 3. Students shouldn't have to go home when the sun sets.",
    category: "Education",
  },
];

const categoryColors: Record<string, string> = {
  "Child Care": "bg-blue-100 text-blue-700",
  "Income Generation": "bg-emerald-100 text-emerald-700",
  "Elderly Care": "bg-purple-100 text-purple-700",
  "Education": "bg-amber-100 text-amber-700",
};

export default async function CampaignsPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />

      {/* Header */}
      <section className="bg-gradient-to-br from-purple-700 to-indigo-800 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-purple-200">Donor Fundraising Campaigns</span>
          </div>
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">Campaigns by Donors, for Projects</h1>
              <p className="text-purple-100 max-w-xl">
                Donors create campaigns around specific projects they believe in — inviting their network to contribute. Every campaign links to a verified, milestone-locked project.
              </p>
            </div>
            {session && (
              <Link href="/campaigns/new" className="flex-shrink-0">
                <Button className="bg-white text-purple-700 hover:bg-gray-50 gap-2 whitespace-nowrap">
                  <Plus className="w-4 h-4" /> Start Campaign
                </Button>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">18</p>
              <p className="text-xs text-purple-200 mt-1">Active campaigns</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">$47K</p>
              <p className="text-xs text-purple-200 mt-1">Raised via campaigns</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">312</p>
              <p className="text-xs text-purple-200 mt-1">Contributors</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {!session && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-4 mb-8 flex items-center justify-between gap-4">
            <p className="text-sm text-purple-800">Log in to start your own campaign around a project you support</p>
            <Link href="/login">
              <Button size="sm" className="bg-purple-700 hover:bg-purple-800 flex-shrink-0">Log In to Start</Button>
            </Link>
          </div>
        )}

        <div className="grid gap-5">
          {campaigns.map((c) => {
            const pct = Math.round((c.raised / c.goal) * 100);
            return (
              <Card key={c.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[c.category] || "bg-gray-100 text-gray-600"}`}>
                              {c.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg leading-snug">{c.title}</h3>
                          <p className="text-sm text-purple-700 mt-1">by {c.creator} · {c.ngo}</p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{c.description}</p>
                        </div>
                        <Link href={`/campaigns/${c.id}`} className="flex-shrink-0">
                          <Button variant="outline" size="sm" className="gap-1.5">
                            View <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-gray-900">${c.raised.toLocaleString()}</span>
                          <span className="text-gray-400">of ${c.goal.toLocaleString()} · {pct}%</span>
                        </div>
                        <Progress value={pct} />
                      </div>

                      <div className="flex items-center gap-5 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.contributors} contributors</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{c.daysLeft} days left</span>
                        <Link href={`/projects/${c.id === "c1" ? "1" : c.id === "c2" ? "2" : c.id === "c3" ? "3" : "6"}`} className="flex items-center gap-1 text-emerald-600 hover:underline">
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
      </div>
    </div>
  );
}
