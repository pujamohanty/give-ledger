import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Clock, CheckCircle2, ExternalLink } from "lucide-react";

const kpis = [
  { label: "Total Received", value: "$93,600", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Total Disbursed", value: "$68,400", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Pending Approval", value: "$12,500", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Milestones Paid", value: "7", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
];

const disbursements = [
  {
    id: "d1",
    project: "Kibera School Water Project",
    milestone: "Equipment procurement",
    amount: 8000,
    status: "APPROVED",
    date: "Jan 20, 2026",
    txHash: "0x4a3b2c1d5e6f...",
  },
  {
    id: "d2",
    project: "Kibera School Water Project",
    milestone: "Installation Phase 1",
    amount: 12000,
    status: "APPROVED",
    date: "Feb 10, 2026",
    txHash: "0x8f7e6d5c4b3a...",
  },
  {
    id: "d3",
    project: "Women Vocational Training Bihar",
    milestone: "Training centre setup",
    amount: 15000,
    status: "APPROVED",
    date: "Dec 15, 2025",
    txHash: "0x2c1d3e4f5a6b...",
  },
  {
    id: "d4",
    project: "Women Vocational Training Bihar",
    milestone: "Cohort 1 training",
    amount: 18000,
    status: "APPROVED",
    date: "Feb 1, 2026",
    txHash: "0x9a8b7c6d5e4f...",
  },
  {
    id: "d5",
    project: "Kibera School Water Project",
    milestone: "Installation Phase 2",
    amount: 5000,
    status: "PENDING",
    date: "Awaiting review",
    txHash: null,
  },
  {
    id: "d6",
    project: "Women Vocational Training Bihar",
    milestone: "Cohort 2 training",
    amount: 7500,
    status: "PENDING",
    date: "Awaiting review",
    txHash: null,
  },
];

const expenseBreakdown = [
  { label: "Direct project costs", pct: 82, color: "bg-emerald-500" },
  { label: "Staff & operations", pct: 11, color: "bg-blue-400" },
  { label: "Fundraising & admin", pct: 7, color: "bg-gray-300" },
];

export default function NgoFinancesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
        <p className="text-gray-500 text-sm mt-1">
          Full financial record of all disbursements and expense allocations.
        </p>
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
        {/* Disbursement history */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Disbursement History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {disbursements.map((d) => (
                  <div key={d.id} className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{d.project}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Milestone: {d.milestone}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            d.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {d.status === "APPROVED" ? "Released" : "Pending"}
                        </span>
                        <span className="text-xs text-gray-400">{d.date}</span>
                      </div>
                      {d.txHash && (
                        <a
                          href={`https://polygonscan.com/tx/${d.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-emerald-700 hover:underline mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {d.txHash}
                        </a>
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold shrink-0 ${
                        d.status === "APPROVED" ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      ${d.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense breakdown */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenseBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold text-gray-900">{item.pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-2">
                Based on all logged expenses across active projects.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-950 text-white">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-white mb-2">On-Chain Transparency</p>
              <p className="text-xs text-emerald-300 mb-3">
                All released disbursements are recorded on Polygon and publicly verifiable.
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
