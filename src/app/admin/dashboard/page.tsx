import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Activity,
} from "lucide-react";

const kpis = [
  { label: "Total Volume", value: "$2.4M", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", change: "+18% this month" },
  { label: "Active NGOs", value: "48", icon: Building2, color: "text-blue-600", bg: "bg-blue-50", change: "3 pending approval" },
  { label: "Total Donors", value: "1,284", icon: Users, color: "text-purple-600", bg: "bg-purple-50", change: "+124 this month" },
  { label: "Pending Disbursements", value: "$31,200", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50", change: "5 requests" },
];

const pendingNgos = [
  { name: "EduBridge Foundation", country: "Nigeria", submitted: "Mar 8", docs: 3 },
  { name: "GreenFields Trust", country: "India", submitted: "Mar 7", docs: 2 },
  { name: "Hope Circle NGO", country: "Kenya", submitted: "Mar 5", docs: 4 },
];

const pendingDisbursements = [
  { ngo: "WaterBridge Kenya", project: "Kibera School Water", amount: 5000, milestone: "Installation Phase 2", submitted: "Mar 9" },
  { ngo: "Pragati Foundation", project: "Women Vocational Training", amount: 7500, milestone: "Cohort 2 training", submitted: "Mar 6" },
  { ngo: "SilverYears Trust", project: "Elderly Care Mysore", amount: 18700, milestone: "Foundation & structure", submitted: "Mar 4" },
];

const recentTransactions = [
  { type: "Donation", user: "Priya S.", project: "Kibera Schools", amount: 500, status: "COMPLETED", time: "2h ago" },
  { type: "Disbursement", user: "WaterBridge", project: "Kibera Schools", amount: 5000, status: "PENDING", time: "5h ago" },
  { type: "Donation", user: "Rahul M.", project: "Bihar Training", amount: 200, status: "COMPLETED", time: "8h ago" },
  { type: "Donation", user: "Sarah K.", project: "Mysore Care", amount: 1000, status: "COMPLETED", time: "1d ago" },
  { type: "Disbursement", user: "Pragati Foundation", project: "Bihar Training", amount: 7500, status: "APPROVED", time: "2d ago" },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Real-time view of all platform activity requiring admin action.
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
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action required alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">Action Required</p>
          <p className="text-amber-700 text-sm mt-0.5">
            3 NGO applications and 5 disbursement requests are awaiting your review.
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link href="/admin/ngos">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              Review NGOs
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Pending NGO Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pending NGO Applications</CardTitle>
            <Link href="/admin/ngos">
              <Button variant="ghost" size="sm" className="text-emerald-700 text-xs">
                View All <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {pendingNgos.map((ngo) => (
                <div key={ngo.name} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{ngo.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ngo.country} · Submitted {ngo.submitted} · {ngo.docs} docs
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors">
                      <XCircle className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Disbursements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Disbursement Queue</CardTitle>
            <Link href="/admin/disbursements">
              <Button variant="ghost" size="sm" className="text-emerald-700 text-xs">
                View All <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {pendingDisbursements.map((d) => (
                <div key={d.project} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{d.ngo}</p>
                      <p className="text-xs text-gray-500">{d.project}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Milestone: {d.milestone} · {d.submitted}
                      </p>
                    </div>
                    <p className="font-bold text-amber-700 text-sm">
                      ${d.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition-colors flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </button>
                    <button className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors flex items-center justify-center gap-1">
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-600" />
            Recent Transactions
          </CardTitle>
          <Link href="/admin/transactions">
            <Button variant="ghost" size="sm" className="text-emerald-700 text-xs">
              Full Log <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Type</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">User/NGO</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Project</th>
                  <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Amount</th>
                  <th className="text-center px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
                  <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentTransactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          tx.type === "Donation"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{tx.user}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{tx.project}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          tx.status === "COMPLETED"
                            ? "text-emerald-700"
                            : tx.status === "APPROVED"
                            ? "text-blue-700"
                            : "text-amber-700"
                        }`}
                      >
                        {tx.status === "COMPLETED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : tx.status === "APPROVED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-gray-400">{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
