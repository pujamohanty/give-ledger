import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2, DollarSign, Users, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, ArrowRight, Activity,
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/login");

  // Platform KPIs
  const [totalDonationResult, ngoCount, donorCount, pendingNgos, pendingDisbursements] =
    await Promise.all([
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.ngo.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "DONOR" } }),
      prisma.ngo.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.disbursement.findMany({
        where: { status: "PENDING" },
        include: {
          milestone: {
            include: { project: { include: { ngo: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const totalVolume = totalDonationResult._sum.amount ?? 0;

  const pendingDisbTotal = pendingDisbursements.reduce(
    (sum, d) => sum + d.requestedAmount,
    0
  );

  // Recent transactions — mix of recent donations and disbursements
  const [recentDonations, recentDisburse] = await Promise.all([
    prisma.donation.findMany({
      include: { user: { select: { name: true } }, project: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.disbursement.findMany({
      include: {
        milestone: { include: { project: { include: { ngo: { select: { orgName: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  type TxRow = {
    key: string;
    type: "Donation" | "Disbursement";
    actor: string;
    project: string;
    amount: number;
    status: string;
    time: Date;
  };

  const txRows: TxRow[] = [
    ...recentDonations.map((d) => ({
      key: `don-${d.id}`,
      type: "Donation" as const,
      actor: d.user.name ?? "Anonymous",
      project: d.project.title,
      amount: d.amount,
      status: d.status,
      time: d.createdAt,
    })),
    ...recentDisburse.map((d) => ({
      key: `disb-${d.id}`,
      type: "Disbursement" as const,
      actor: d.milestone.project.ngo.orgName,
      project: d.milestone.project.title,
      amount: d.requestedAmount,
      status: d.status,
      time: d.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

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
        {[
          { label: "Total Volume", value: formatCurrency(totalVolume), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", sub: "All-time donations" },
          { label: "Active NGOs", value: String(ngoCount), icon: Building2, color: "text-blue-600", bg: "bg-blue-50", sub: `${pendingNgos.length} pending approval` },
          { label: "Total Donors", value: String(donorCount), icon: Users, color: "text-purple-600", bg: "bg-purple-50", sub: "Registered donors" },
          { label: "Pending Disbursements", value: formatCurrency(pendingDisbTotal), icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50", sub: `${pendingDisbursements.length} requests` },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 ${kpi.bg} rounded-lg flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action required alert */}
      {(pendingNgos.length > 0 || pendingDisbursements.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Action Required</p>
            <p className="text-amber-700 text-sm mt-0.5">
              {pendingNgos.length > 0 && `${pendingNgos.length} NGO application${pendingNgos.length > 1 ? "s" : ""}`}
              {pendingNgos.length > 0 && pendingDisbursements.length > 0 && " and "}
              {pendingDisbursements.length > 0 && `${pendingDisbursements.length} disbursement request${pendingDisbursements.length > 1 ? "s" : ""}`}
              {" "}awaiting your review.
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
      )}

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
            {pendingNgos.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No pending applications.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingNgos.map((ngo) => (
                  <div key={ngo.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{ngo.orgName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ngo.country ?? "Unknown"} · Submitted {formatDate(ngo.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/ngos`}>
                        <button className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center hover:bg-emerald-100 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            {pendingDisbursements.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No pending disbursements.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingDisbursements.map((d) => (
                  <div key={d.id} className="px-5 py-4">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{d.milestone.project.ngo.orgName}</p>
                        <p className="text-xs text-gray-500">{d.milestone.project.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Milestone: {d.milestone.name} · {formatDate(d.createdAt)}
                        </p>
                      </div>
                      <p className="font-bold text-amber-700 text-sm">{formatCurrency(d.requestedAmount)}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Link href="/admin/disbursements" className="flex-1">
                        <button className="w-full text-xs py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition-colors flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Review
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {txRows.map((tx) => (
                  <tr key={tx.key} className="hover:bg-gray-50 transition-colors">
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
                    <td className="px-5 py-3 text-gray-700">{tx.actor}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{tx.project}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          tx.status === "COMPLETED" || tx.status === "APPROVED"
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {tx.status === "COMPLETED" || tx.status === "APPROVED" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-gray-400">
                      {formatDate(tx.time)}
                    </td>
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
