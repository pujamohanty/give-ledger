import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  FolderOpen,
  Clock,
  Users,
  ExternalLink,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";

// Mock data for the donor dashboard
const kpis = [
  { label: "Total Donated", value: "$1,250", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Projects Funded", value: "4", icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Pledges", value: "2", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Lives Impacted", value: "~340", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
];

const myProjects = [
  {
    id: "1",
    title: "Clean Water for Kibera Schools",
    ngo: "WaterBridge Kenya",
    donated: 150,
    raised: 18400,
    goal: 25000,
    milestones: [
      { name: "Equipment procurement", status: "COMPLETED", date: "Jan 15" },
      { name: "Installation Phase 1", status: "COMPLETED", date: "Feb 3" },
      { name: "Installation Phase 2", status: "UNDER_REVIEW", date: "Mar 20" },
      { name: "Community training", status: "PENDING", date: "Apr 10" },
    ],
    txHash: "0x4a3b2c1d...",
  },
  {
    id: "2",
    title: "Livelihood Training - Rural Bihar",
    ngo: "Pragati Foundation",
    donated: 500,
    raised: 31200,
    goal: 40000,
    milestones: [
      { name: "Training centre setup", status: "COMPLETED", date: "Dec 10" },
      { name: "Cohort 1 training", status: "COMPLETED", date: "Jan 28" },
      { name: "Cohort 2 training", status: "PENDING", date: "Mar 15" },
    ],
    txHash: "0x8f7e6d5c...",
  },
];

const recentDonations = [
  { project: "Clean Water for Kibera Schools", amount: 150, date: "Mar 1", txHash: "0x4a3b..." },
  { project: "Livelihood Training - Rural Bihar", amount: 500, date: "Feb 14", txHash: "0x8f7e..." },
  { project: "Elderly Care Home - Mysore", amount: 300, date: "Jan 5", txHash: "0x2c1d..." },
  { project: "Elderly Care Home - Mysore", amount: 300, date: "Dec 5", txHash: "0x9a8b..." },
];

function MilestoneIcon({ status }: { status: string }) {
  if (status === "COMPLETED")
    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (status === "UNDER_REVIEW")
    return <Circle className="w-4 h-4 text-amber-500 fill-amber-100" />;
  return <Circle className="w-4 h-4 text-gray-300" />;
}

export default function DonorDashboard() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Impact Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Every donation tracked. Every milestone verified.
          </p>
        </div>
        <Link href="/projects">
          <Button className="flex items-center gap-2">
            Donate Again <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 ${kpi.bg} rounded-lg flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Funded Projects with Milestones */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Projects You Fund</h2>
          {myProjects.map((project) => {
            const pct = Math.round((project.raised / project.goal) * 100);
            const completed = project.milestones.filter(
              (m) => m.status === "COMPLETED"
            ).length;
            return (
              <Card key={project.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {project.title}
                      </h3>
                      <p className="text-xs text-emerald-700">{project.ngo}</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      You donated ${project.donated}
                    </span>
                  </div>

                  <div className="mt-3 mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Overall funding</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} />
                  </div>

                  {/* Milestone timeline */}
                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Milestones ({completed}/{project.milestones.length} complete)
                    </p>
                    {project.milestones.map((m) => (
                      <div key={m.name} className="flex items-center gap-2">
                        <MilestoneIcon status={m.status} />
                        <span
                          className={`text-xs flex-1 ${
                            m.status === "COMPLETED"
                              ? "text-gray-600 line-through"
                              : m.status === "UNDER_REVIEW"
                              ? "text-amber-700 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {m.name}
                        </span>
                        <span className="text-xs text-gray-400">{m.date}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">
                      {project.txHash}
                    </span>
                    <a
                      href={`https://polygonscan.com/tx/${project.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-emerald-700 hover:underline"
                    >
                      View on chain <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Fund allocation donut - simplified as text for now */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fund Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Direct project costs", pct: 82, color: "bg-emerald-500" },
                  { label: "Admin & operations", pct: 12, color: "bg-blue-400" },
                  { label: "Fundraising", pct: 6, color: "bg-gray-300" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Based on all NGO-logged expenses across your funded projects.
              </p>
            </CardContent>
          </Card>

          {/* Recent transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Donations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {recentDonations.map((d, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {d.project}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <span>{d.date}</span>
                        <span>·</span>
                        <span className="font-mono">{d.txHash}</span>
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">
                      +${d.amount}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <Link href="/donor/donations">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Transactions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Impact summary */}
          <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-5">
              <h3 className="font-semibold text-emerald-900 mb-3">Your Impact</h3>
              <div className="space-y-2">
                {[
                  { label: "Students with clean water", value: "240" },
                  { label: "Women in vocational training", value: "18" },
                  { label: "Elderly residents supported", value: "8" },
                ].map((impact) => (
                  <div key={impact.label} className="flex justify-between">
                    <span className="text-sm text-emerald-800">{impact.label}</span>
                    <span className="font-bold text-emerald-900">{impact.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
