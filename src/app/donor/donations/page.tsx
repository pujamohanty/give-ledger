import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, DollarSign, TrendingUp, Calendar } from "lucide-react";

const donations = [
  {
    id: "1",
    project: "Clean Water for Kibera Schools",
    ngo: "WaterBridge Kenya",
    amount: 150,
    date: "Mar 1, 2026",
    status: "Confirmed",
    txHash: "0x4a3b2c1d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    milestone: "Installation Phase 2",
  },
  {
    id: "2",
    project: "Livelihood Training - Rural Bihar",
    ngo: "Pragati Foundation",
    amount: 500,
    date: "Feb 14, 2026",
    status: "Confirmed",
    txHash: "0x8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e",
    milestone: "Cohort 1 training",
  },
  {
    id: "3",
    project: "Elderly Care Home - Mysore",
    ngo: "Dignity Foundation",
    amount: 300,
    date: "Jan 5, 2026",
    status: "Confirmed",
    txHash: "0x2c1d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
    milestone: "Infrastructure setup",
  },
  {
    id: "4",
    project: "Elderly Care Home - Mysore",
    ngo: "Dignity Foundation",
    amount: 300,
    date: "Dec 5, 2025",
    status: "Confirmed",
    txHash: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b",
    milestone: "Medical supplies",
  },
];

const summary = [
  { label: "Total Donated", value: "$1,250", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Transactions", value: "4", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Projects Funded", value: "3", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
];

export default function DonationsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
        <p className="text-gray-500 text-sm mt-1">
          Full history of every donation with on-chain transaction records.
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {summary.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {donations.map((d) => (
              <div key={d.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {d.project}
                      </p>
                      <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-xs shrink-0">
                        {d.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-700 mb-1">{d.ngo}</p>
                    <p className="text-xs text-gray-400 mb-2">
                      Milestone: {d.milestone} · {d.date}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400 font-mono truncate max-w-xs">
                        {d.txHash}
                      </span>
                      <a
                        href={`https://polygonscan.com/tx/${d.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-emerald-700 hover:underline shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View on chain
                      </a>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-700 shrink-0">
                    +${d.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
