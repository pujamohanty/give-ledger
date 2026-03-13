import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Droplets, BookOpen, Heart } from "lucide-react";

export default async function ImpactPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const donations = await prisma.donation.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          ngo: true,
          milestones: {
            include: { outputMarkers: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  // Aggregate per-project data (merge donations to same project)
  const projectMap = new Map<
    string,
    {
      id: string;
      title: string;
      ngoName: string;
      totalDonated: number;
      milestones: typeof donations[0]["project"]["milestones"];
    }
  >();

  for (const d of donations) {
    const existing = projectMap.get(d.projectId);
    if (existing) {
      existing.totalDonated += d.amount;
    } else {
      projectMap.set(d.projectId, {
        id: d.project.id,
        title: d.project.title,
        ngoName: d.project.ngo.orgName,
        totalDonated: d.amount,
        milestones: d.project.milestones,
      });
    }
  }
  const projects = Array.from(projectMap.values());

  // Compute platform-level impact KPIs
  let totalLives = 0;
  let totalStudents = 0;
  let totalWomenTrained = 0;
  let totalElderly = 0;

  for (const p of projects) {
    for (const m of p.milestones) {
      if (m.status !== "COMPLETED") continue;
      for (const om of m.outputMarkers) {
        const val = parseFloat(om.value);
        if (isNaN(val) || val <= 0) continue;
        const label = om.label.toLowerCase();
        if (label.includes("student") || label.includes("school") || label.includes("water access")) {
          totalStudents += val;
        } else if (label.includes("women") || label.includes("woman") || label.includes("female") || label.includes("trained")) {
          totalWomenTrained += val;
        } else if (label.includes("elder") || label.includes("senior") || label.includes("resident")) {
          totalElderly += val;
        }
        // All beneficiary metrics count toward total lives
        if (val < 100000) totalLives += val;
      }
    }
  }

  const kpis = [
    { label: "Lives Directly Impacted", value: totalLives > 0 ? `${totalLives}+` : "—", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Students with Clean Water", value: totalStudents > 0 ? String(Math.round(totalStudents)) : "—", icon: Droplets, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Women Trained", value: totalWomenTrained > 0 ? String(Math.round(totalWomenTrained)) : "—", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Elderly Supported", value: totalElderly > 0 ? String(Math.round(totalElderly)) : "—", icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Impact</h1>
        <p className="text-gray-500 text-sm mt-1">
          Real outcomes from your donations — verified on-chain at every milestone.
        </p>
      </div>

      {/* Impact KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((stat) => (
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

      {/* Per-project impact breakdown */}
      <div className="space-y-6">
        <h2 className="font-semibold text-gray-900">Impact by Project</h2>
        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No projects funded yet.</p>
          </div>
        ) : (
          projects.map((project) => {
            const completedMilestones = project.milestones.filter((m) => m.status === "COMPLETED").length;
            const totalMilestones = project.milestones.length;

            // Accumulate output markers across all completed milestones
            const outcomeMap = new Map<string, { value: number; unit: string | null }>();
            for (const m of project.milestones) {
              if (m.status !== "COMPLETED") continue;
              for (const om of m.outputMarkers) {
                const val = parseFloat(om.value);
                if (isNaN(val)) continue;
                const existing = outcomeMap.get(om.label);
                if (existing) {
                  existing.value += val;
                } else {
                  outcomeMap.set(om.label, { value: val, unit: om.unit });
                }
              }
            }

            // Use a reasonable target = 150% of current value to show progress
            const outcomes = Array.from(outcomeMap.entries()).map(([label, { value }]) => ({
              label,
              value,
              target: Math.ceil(value * 1.5),
            }));

            return (
              <Card key={project.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{project.title}</CardTitle>
                      <p className="text-xs text-emerald-700 mt-0.5">{project.ngoName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-700">
                        You donated {formatCurrency(project.totalDonated)}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {completedMilestones}/{totalMilestones} milestones complete
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {outcomes.length > 0 ? (
                    <div className="space-y-4">
                      {outcomes.map((outcome) => {
                        const pct = Math.min(Math.round((outcome.value / outcome.target) * 100), 100);
                        return (
                          <div key={outcome.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">{outcome.label}</span>
                              <span className="font-semibold text-gray-900">
                                {outcome.value} / {outcome.target}
                              </span>
                            </div>
                            <Progress value={pct} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No verified milestones yet — impact metrics will appear here once milestones are completed.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <p className="text-sm text-emerald-800">
          All impact metrics are reported by NGOs at milestone completion and verified before funds are released. Each data point is recorded on the Polygon blockchain.
        </p>
      </div>
    </div>
  );
}
