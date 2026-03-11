import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle2, Users, TrendingUp, Droplets } from "lucide-react";

const impactSummary = [
  { label: "Total lives impacted", value: "340+", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Milestones completed", value: "7", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Funds utilised", value: "73%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Beneficiaries with water", value: "240", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50" },
];

const milestoneReports = [
  {
    project: "Kibera School Water Project",
    milestone: "Equipment procurement",
    completedDate: "Jan 15, 2026",
    outputs: [
      { label: "Water pumps procured", achieved: 4, target: 4 },
      { label: "Pipes (metres) installed", achieved: 120, target: 120 },
    ],
    evidenceCount: 3,
    verifiedBy: "Admin — Jane K.",
  },
  {
    project: "Kibera School Water Project",
    milestone: "Installation Phase 1",
    completedDate: "Feb 3, 2026",
    outputs: [
      { label: "Water points operational", achieved: 2, target: 2 },
      { label: "Students with access", achieved: 120, target: 120 },
    ],
    evidenceCount: 5,
    verifiedBy: "Admin — Jane K.",
  },
  {
    project: "Women Vocational Training Bihar",
    milestone: "Training centre setup",
    completedDate: "Dec 10, 2025",
    outputs: [
      { label: "Training rooms prepared", achieved: 2, target: 2 },
      { label: "Equipment installed", achieved: 15, target: 15 },
    ],
    evidenceCount: 4,
    verifiedBy: "Admin — Raj S.",
  },
  {
    project: "Women Vocational Training Bihar",
    milestone: "Cohort 1 training",
    completedDate: "Jan 28, 2026",
    outputs: [
      { label: "Women trained", achieved: 18, target: 20 },
      { label: "Certifications issued", achieved: 16, target: 20 },
    ],
    evidenceCount: 6,
    verifiedBy: "Admin — Raj S.",
  },
];

export default function NgoReportsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impact Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            Verified milestone reports and output metrics across all your projects.
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Export PDF
        </Button>
      </div>

      {/* Impact summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {impactSummary.map((stat) => (
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

      {/* Milestone reports */}
      <div className="space-y-5">
        <h2 className="font-semibold text-gray-900">Verified Milestone Reports</h2>
        {milestoneReports.map((report, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <CardTitle className="text-sm font-semibold">{report.milestone}</CardTitle>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700">{report.project}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Completed</p>
                  <p className="text-xs font-medium text-gray-700">{report.completedDate}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-4">
                {report.outputs.map((output) => {
                  const pct = Math.min(Math.round((output.achieved / output.target) * 100), 100);
                  return (
                    <div key={output.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{output.label}</span>
                        <span className="font-semibold text-gray-900">
                          {output.achieved} / {output.target}
                        </span>
                      </div>
                      <Progress value={pct} />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                <span>{report.evidenceCount} evidence files submitted</span>
                <span>Verified by {report.verifiedBy}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
