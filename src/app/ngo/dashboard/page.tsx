import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ExternalLink,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const kpis = [
  { label: "Total Received", value: "$93,600", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Active Projects", value: "3", icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Pending Disburse.", value: "$12,500", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Milestones Done", value: "7/12", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
];

const projects = [
  {
    id: "p1",
    title: "Kibera School Water Project",
    status: "ACTIVE",
    raised: 18400,
    goal: 25000,
    milestones: 4,
    completedMilestones: 2,
    nextMilestone: "Installation Phase 2",
    nextMilestoneDate: "Mar 20",
    pendingDisbursement: 5000,
  },
  {
    id: "p2",
    title: "Women Vocational Training Bihar",
    status: "ACTIVE",
    raised: 31200,
    goal: 40000,
    milestones: 3,
    completedMilestones: 2,
    nextMilestone: "Cohort 2 training",
    nextMilestoneDate: "Mar 15",
    pendingDisbursement: 7500,
  },
  {
    id: "p3",
    title: "Elderly Care Infrastructure",
    status: "PENDING_REVIEW",
    raised: 0,
    goal: 80000,
    milestones: 5,
    completedMilestones: 0,
    nextMilestone: "Awaiting admin approval",
    nextMilestoneDate: "-",
    pendingDisbursement: 0,
  },
];

const recentActivity = [
  { type: "donation", desc: "New donation received", amount: "+$500", time: "2h ago", color: "text-emerald-600" },
  { type: "milestone", desc: "Milestone under review", amount: "Phase 2", time: "1d ago", color: "text-amber-600" },
  { type: "disbursement", desc: "Disbursement approved", amount: "+$5,000", time: "3d ago", color: "text-blue-600" },
  { type: "donation", desc: "New donation received", amount: "+$150", time: "4d ago", color: "text-emerald-600" },
];

export default function NgoDashboard() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NGO Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your projects and milestone disbursements.
          </p>
        </div>
        <Link href="/ngo/projects/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </Link>
      </div>

      {/* KPIs */}
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Projects</h2>
            <Link href="/ngo/projects">
              <Button variant="ghost" size="sm" className="text-emerald-700">
                View All <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </div>

          {projects.map((project) => {
            const pct = project.goal > 0 ? Math.round((project.raised / project.goal) * 100) : 0;
            return (
              <Card key={project.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{project.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            project.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {project.status === "ACTIVE" ? "Active" : "Pending Review"}
                        </span>
                      </div>
                    </div>
                    {project.pendingDisbursement > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Pending release</p>
                        <p className="text-sm font-bold text-amber-700">
                          ${project.pendingDisbursement.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {project.status === "ACTIVE" && (
                    <>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>${project.raised.toLocaleString()} raised</span>
                          <span>{pct}% of ${project.goal.toLocaleString()}</span>
                        </div>
                        <Progress value={pct} />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-gray-500">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {project.completedMilestones}/{project.milestones} milestones
                        </div>
                        <div className="flex items-center gap-1 text-amber-600">
                          <Clock className="w-3 h-3" />
                          Next: {project.nextMilestone} ({project.nextMilestoneDate})
                        </div>
                      </div>
                    </>
                  )}

                  {project.status === "PENDING_REVIEW" && (
                    <div className="flex items-center gap-2 text-amber-700 text-xs bg-amber-50 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      Your project is under admin review. You will be notified within 48 hours.
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
                    <Link href="/ngo/projects" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Manage Project
                      </Button>
                    </Link>
                    {project.pendingDisbursement > 0 && (
                      <Link href={`/ngo/submit-milestone?project=${project.id}`} className="flex-1">
                        <Button size="sm" className="w-full text-xs">
                          Request Funds
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Financial summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total received", value: "$93,600", color: "text-emerald-700" },
                { label: "Total disbursed", value: "$68,400", color: "text-gray-900" },
                { label: "Pending approval", value: "$12,500", color: "text-amber-700" },
                { label: "Still to raise", value: "$51,800", color: "text-gray-500" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
              <Link href="/ngo/finances">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Full Financial Report
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm text-gray-700">{item.desc}</p>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                    <span className={`text-sm font-semibold ${item.color}`}>
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* On-chain proof */}
          <Card className="bg-emerald-950 text-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <p className="text-sm font-semibold">On-Chain Records</p>
              </div>
              <p className="text-xs text-emerald-300 mb-3">
                All your disbursements are recorded on Polygon. Share this with donors for full transparency.
              </p>
              <a
                href="https://polygonscan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 underline"
              >
                View on PolygonScan
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
