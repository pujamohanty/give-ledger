import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Droplets, BookOpen, Heart } from "lucide-react";

const impactStats = [
  { label: "Lives Directly Impacted", value: "340+", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Students with Clean Water", value: "240", icon: Droplets, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Women Trained", value: "18", icon: BookOpen, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Elderly Supported", value: "8", icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
];

const projects = [
  {
    title: "Clean Water for Kibera Schools",
    ngo: "WaterBridge Kenya",
    donated: 150,
    outcomes: [
      { label: "Students with clean water access", value: 240, target: 300 },
      { label: "Water points installed", value: 3, target: 4 },
      { label: "Maintenance staff trained", value: 6, target: 6 },
    ],
    completedMilestones: 2,
    totalMilestones: 4,
  },
  {
    title: "Livelihood Training - Rural Bihar",
    ngo: "Pragati Foundation",
    donated: 500,
    outcomes: [
      { label: "Women completed training", value: 18, target: 30 },
      { label: "Businesses started", value: 7, target: 15 },
      { label: "Average income increase (%)", value: 35, target: 50 },
    ],
    completedMilestones: 2,
    totalMilestones: 3,
  },
  {
    title: "Elderly Care Home - Mysore",
    ngo: "Dignity Foundation",
    donated: 600,
    outcomes: [
      { label: "Elderly residents supported", value: 8, target: 12 },
      { label: "Medical checkups conducted", value: 24, target: 36 },
      { label: "Volunteers engaged", value: 15, target: 20 },
    ],
    completedMilestones: 1,
    totalMilestones: 3,
  },
];

export default function ImpactPage() {
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
        {impactStats.map((stat) => (
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
        {projects.map((project) => (
          <Card key={project.title}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{project.title}</CardTitle>
                  <p className="text-xs text-emerald-700 mt-0.5">{project.ngo}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-700">
                    You donated ${project.donated}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {project.completedMilestones}/{project.totalMilestones} milestones complete
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {project.outcomes.map((outcome) => {
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Note */}
      <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <p className="text-sm text-emerald-800">
          All impact metrics are reported by NGOs at milestone completion and verified before funds are released. Each data point is recorded on the Polygon blockchain.
        </p>
      </div>
    </div>
  );
}
