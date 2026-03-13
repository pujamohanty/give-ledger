import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, FolderOpen, Clock, CheckCircle2, AlertCircle, Plus,
  ExternalLink, ArrowRight, TrendingUp,
} from "lucide-react";

export default async function NgoDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const ngo = await prisma.ngo.findUnique({
    where: { userId },
    include: {
      projects: {
        include: {
          milestones: {
            include: { disbursement: true },
            orderBy: { orderIndex: "asc" },
          },
          donations: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ngo) redirect("/login");

  // Platform-level activity
  const recentDonations = await prisma.donation.findMany({
    where: { project: { ngoId: ngo.id } },
    include: { project: true, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // KPI calculations
  const allMilestones = ngo.projects.flatMap((p) => p.milestones);
  const completedMilestones = allMilestones.filter((m) => m.status === "COMPLETED");
  const activeProjects = ngo.projects.filter((p) => p.status === "ACTIVE");

  const totalReceived = ngo.projects.reduce((sum, p) => sum + p.raisedAmount, 0);

  const pendingDisbursements = allMilestones
    .flatMap((m) => (m.disbursement && m.disbursement.status === "PENDING" ? [m.disbursement] : []))
    .reduce((sum, d) => sum + d.requestedAmount, 0);

  const approvedDisbursements = allMilestones
    .flatMap((m) => (m.disbursement && m.disbursement.status === "APPROVED" ? [m.disbursement] : []))
    .reduce((sum, d) => sum + (d.approvedAmount ?? d.requestedAmount), 0);

  const totalGoal = ngo.projects.reduce((sum, p) => sum + p.goalAmount, 0);

  // Build recent activity from donations and disbursements
  type ActivityItem = { desc: string; amount: string; time: string; color: string };
  const activityItems: ActivityItem[] = [];

  for (const d of recentDonations.slice(0, 4)) {
    activityItems.push({
      desc: `Donation to ${d.project.title}`,
      amount: `+${formatCurrency(d.amount)}`,
      time: formatDate(d.createdAt),
      color: "text-emerald-600",
    });
  }

  const recentDisbursements = allMilestones
    .flatMap((m) => (m.disbursement ? [{ ...m.disbursement, milestoneName: m.name }] : []))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  for (const d of recentDisbursements) {
    activityItems.push({
      desc: d.status === "APPROVED" ? `Disbursement approved` : `Disbursement under review`,
      amount: d.status === "APPROVED" ? `+${formatCurrency(d.approvedAmount ?? d.requestedAmount)}` : `${formatCurrency(d.requestedAmount)}`,
      time: formatDate(d.createdAt),
      color: d.status === "APPROVED" ? "text-blue-600" : "text-amber-600",
    });
  }

  // Sort by recency and take top 5
  const sortedActivity = activityItems.slice(0, 5);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{ngo.orgName}</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your projects and milestone disbursements.</p>
        </div>
        <Link href="/ngo/projects/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Received", value: formatCurrency(totalReceived), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Projects", value: String(activeProjects.length), icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending Release", value: formatCurrency(pendingDisbursements), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Milestones Done", value: `${completedMilestones.length}/${allMilestones.length}`, icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((kpi) => (
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

          {ngo.projects.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No projects yet — create your first project to start fundraising.</p>
              <Link href="/ngo/projects/new">
                <Button size="sm" className="mt-4">Create Project</Button>
              </Link>
            </div>
          ) : (
            ngo.projects.map((project) => {
              const pct = project.goalAmount > 0
                ? Math.round((project.raisedAmount / project.goalAmount) * 100)
                : 0;
              const completed = project.milestones.filter((m) => m.status === "COMPLETED").length;
              const pendingRelease = project.milestones
                .flatMap((m) => (m.disbursement?.status === "PENDING" ? [m.disbursement.requestedAmount] : []))
                .reduce((sum, v) => sum + v, 0);
              const nextMilestone = project.milestones.find((m) => m.status === "PENDING" || m.status === "UNDER_REVIEW");

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
                                : project.status === "PENDING_REVIEW"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {project.status === "ACTIVE"
                              ? "Active"
                              : project.status === "PENDING_REVIEW"
                              ? "Pending Review"
                              : project.status}
                          </span>
                        </div>
                      </div>
                      {pendingRelease > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Pending release</p>
                          <p className="text-sm font-bold text-amber-700">{formatCurrency(pendingRelease)}</p>
                        </div>
                      )}
                    </div>

                    {project.status === "ACTIVE" && (
                      <>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{formatCurrency(project.raisedAmount)} raised</span>
                            <span>{pct}% of {formatCurrency(project.goalAmount)}</span>
                          </div>
                          <Progress value={pct} />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-gray-500">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {completed}/{project.milestones.length} milestones
                          </div>
                          {nextMilestone && (
                            <div className="flex items-center gap-1 text-amber-600">
                              <Clock className="w-3 h-3" />
                              Next: {nextMilestone.name}
                              {nextMilestone.targetDate && ` (${formatDate(nextMilestone.targetDate)})`}
                            </div>
                          )}
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
                      {pendingRelease > 0 && (
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
            })
          )}
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
                { label: "Total received", value: formatCurrency(totalReceived), color: "text-emerald-700" },
                { label: "Total disbursed", value: formatCurrency(approvedDisbursements), color: "text-gray-900" },
                { label: "Pending approval", value: formatCurrency(pendingDisbursements), color: "text-amber-700" },
                { label: "Still to raise", value: formatCurrency(Math.max(0, totalGoal - totalReceived)), color: "text-gray-500" },
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
              {sortedActivity.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-400 text-center">No activity yet.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {sortedActivity.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm text-gray-700">{item.desc}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                      </div>
                      <span className={`text-sm font-semibold ${item.color}`}>{item.amount}</span>
                    </div>
                  ))}
                </div>
              )}
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
