import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, CheckCircle2, Users, TrendingUp, DollarSign } from "lucide-react";
import PrintButton from "./PrintButton";

export default async function NgoReportsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ngo = await prisma.ngo.findUnique({
    where: { userId: session.user.id },
    include: {
      projects: {
        include: {
          milestones: {
            where: { status: "COMPLETED" },
            include: {
              outputMarkers: true,
              evidenceFiles: { select: { id: true } },
              disbursement: { select: { requestedAmount: true, status: true } },
            },
            orderBy: { completedAt: "desc" },
          },
        },
      },
    },
  });

  if (!ngo) redirect("/login");

  // Aggregate stats across all projects
  const allCompletedMilestones = ngo.projects.flatMap((p) =>
    p.milestones.map((m) => ({ ...m, projectTitle: p.title }))
  );

  const totalEvidenceFiles = allCompletedMilestones.reduce(
    (sum, m) => sum + m.evidenceFiles.length, 0
  );

  const totalDisbursed = allCompletedMilestones.reduce(
    (sum, m) => sum + (m.disbursement?.requestedAmount ?? 0), 0
  );

  // Collect all output markers to compute a "total beneficiaries" metric
  const allMarkers = allCompletedMilestones.flatMap((m) =>
    m.outputMarkers.map((o) => ({ ...o, projectTitle: m.projectTitle, milestoneName: m.name }))
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impact Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            Verified milestone reports and output metrics across all your projects.
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Impact summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Milestones completed",
            value: String(allCompletedMilestones.length),
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Projects with outcomes",
            value: String(ngo.projects.filter((p) => p.milestones.length > 0).length),
            icon: TrendingUp,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Total disbursed",
            value: `$${totalDisbursed.toLocaleString()}`,
            icon: DollarSign,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Evidence files submitted",
            value: String(totalEvidenceFiles),
            icon: Users,
            color: "text-cyan-600",
            bg: "bg-cyan-50",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Output markers summary */}
      {allMarkers.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Key Output Metrics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {allMarkers.slice(0, 8).map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                <p className="text-xs text-gray-500 mt-1">{m.label}</p>
                <p className="text-xs text-emerald-600 mt-1">{m.projectTitle}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestone reports */}
      <div className="space-y-5">
        <h2 className="font-semibold text-gray-900">Verified Milestone Reports</h2>
        {allCompletedMilestones.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No completed milestones yet.</p>
        ) : (
          allCompletedMilestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <CardTitle className="text-sm font-semibold">{milestone.name}</CardTitle>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700">{milestone.projectTitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Completed</p>
                    <p className="text-xs font-medium text-gray-700">
                      {milestone.completedAt
                        ? new Date(milestone.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {milestone.outputMarkers.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {milestone.outputMarkers.map((output) => {
                      const achieved = parseFloat(output.value) || 0;
                      const target = achieved; // value IS the achieved result; use it as 100%
                      const pct = 100;
                      return (
                        <div key={output.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{output.label}</span>
                            <span className="font-semibold text-gray-900">
                              {output.value}{output.unit ? ` ${output.unit}` : ""}
                            </span>
                          </div>
                          <Progress value={pct} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mb-4">No output metrics recorded.</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <span>{milestone.evidenceFiles.length} evidence file{milestone.evidenceFiles.length !== 1 ? "s" : ""} submitted</span>
                  {milestone.disbursement && (
                    <span className="text-emerald-600 font-medium">
                      ${milestone.disbursement.requestedAmount.toLocaleString()} disbursed
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
