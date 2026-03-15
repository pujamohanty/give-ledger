import Link from "next/link";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

const platformStats = [
  { label: "Total Disbursed", value: "$2.4M", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", sub: "Across 47 projects" },
  { label: "Lives Impacted", value: "38,400", icon: Users, color: "text-blue-600", bg: "bg-blue-50", sub: "Verified beneficiaries" },
  { label: "Milestones Verified", value: "312", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50", sub: "100% evidence-backed" },
  { label: "Active NGOs", value: "23", icon: Globe, color: "text-amber-600", bg: "bg-amber-50", sub: "Across 14 countries" },
];

const impactGrowth = [
  { month: "Sep '25", disbursed: 85000, lives: 1200 },
  { month: "Oct '25", disbursed: 142000, lives: 3800 },
  { month: "Nov '25", disbursed: 189000, lives: 7200 },
  { month: "Dec '25", disbursed: 276000, lives: 12400 },
  { month: "Jan '26", disbursed: 398000, lives: 21000 },
  { month: "Feb '26", disbursed: 521000, lives: 31500 },
  { month: "Mar '26", disbursed: 624000, lives: 38400 },
];
const maxDisbursed = Math.max(...impactGrowth.map((d) => d.disbursed));

const categoryBreakdown = [
  { category: "Child Care", pct: 34, color: "bg-blue-500", projects: 16, amount: "$812K" },
  { category: "Income Generation", pct: 28, color: "bg-emerald-500", projects: 12, amount: "$668K" },
  { category: "Elderly Care", pct: 19, color: "bg-purple-500", projects: 9, amount: "$454K" },
  { category: "Accessibility", pct: 12, color: "bg-amber-500", projects: 6, amount: "$287K" },
  { category: "Animal Welfare", pct: 7, color: "bg-pink-400", projects: 4, amount: "$167K" },
];

const featuredMilestones = [
  {
    id: "m1",
    ngo: "WaterBridge Kenya",
    project: "Clean Water for Kibera Schools",
    milestone: "Installation — Schools 1–6",
    metric: "2,400 children now have daily clean water access",
    txHash: "0x7d6e5f4c...",
    date: "Feb 3, 2026",
    category: "Child Care",
  },
  {
    id: "m2",
    ngo: "Pragati Foundation",
    project: "Livelihood Training - Rural Bihar",
    milestone: "Cohort 1 — 45 Women Trained",
    metric: "45 women certified, 7 businesses started within 30 days",
    txHash: "0x9a8b7c6d...",
    date: "Jan 28, 2026",
    category: "Income Generation",
  },
  {
    id: "m2b",
    ngo: "SilverYears Trust",
    project: "Elderly Care Home - Mysore",
    milestone: "Foundation & Ground Floor Structure",
    metric: "60% of 50-bed care facility now structurally complete",
    txHash: "0x1a2b3c4d...",
    date: "Jan 20, 2026",
    category: "Elderly Care",
  },
];

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

const recentOnChain = [
  { type: "Disbursement", project: "Kibera Water Schools", amount: "$7,500", txHash: "0x7d6e5f4c...", date: "Feb 3" },
  { type: "Disbursement", project: "Rural Bihar Training", amount: "$12,000", txHash: "0x9a8b7c6d...", date: "Jan 28" },
  { type: "Disbursement", project: "Mysore Elderly Care", amount: "$25,000", txHash: "0x1a2b3c4d...", date: "Jan 20" },
  { type: "Disbursement", project: "Kibera Water Schools", amount: "$6,000", txHash: "0x4a3b2c1d...", date: "Jan 15" },
  { type: "Disbursement", project: "Rural Bihar Training", amount: "$8,000", txHash: "0x2c1d3e4f...", date: "Dec 10" },
];

export default async function ImpactPage() {
  const session = await auth();

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
            GiveLedger releases funds only when NGOs prove milestones are complete. Here's what that accountability has produced.
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
        <section>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Growth Over Time</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Cumulative funds disbursed and verified beneficiaries</p>

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
                          ${(row.disbursed / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-20 text-right flex-shrink-0">
                      {row.lives.toLocaleString()} lives
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Impact by cause */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Impact by Cause</h2>
          <div className="space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{cat.category}</p>
                    <p className="text-sm text-gray-500">{cat.projects} projects · {cat.amount} disbursed</p>
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

          <div className="grid gap-4">
            {featuredMilestones.map((m) => (
              <Card key={m.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {m.category}
                        </span>
                        <span className="text-xs text-gray-400">{m.date}</span>
                      </div>
                      <p className="font-semibold text-gray-900">{m.milestone}</p>
                      <p className="text-sm text-emerald-700 mt-0.5">{m.ngo} · {m.project}</p>
                      <p className="text-sm text-gray-600 mt-2 font-medium">{m.metric}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <Link href={`/share/${m.id}`} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                          See full proof →
                        </Link>
                        <a
                          href={`https://polygonscan.com/tx/${m.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600"
                        >
                          <span className="font-mono">{m.txHash}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* On-chain ledger preview */}
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
                    {recentOnChain.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-gray-900 font-medium">{row.project}</td>
                        <td className="px-5 py-3 text-emerald-700 font-semibold">{row.amount}</td>
                        <td className="px-5 py-3">
                          <a
                            href={`https://polygonscan.com/tx/${row.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-mono text-gray-500 hover:text-emerald-600"
                          >
                            {row.txHash} <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">What Donors & NGOs Say</h2>
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
