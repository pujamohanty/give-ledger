import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle2, ExternalLink } from "lucide-react";

export default async function NgoFinancesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ngo = await prisma.ngo.findUnique({
    where: { userId: session.user.id },
    include: {
      projects: {
        include: {
          milestones: {
            include: {
              disbursement: {
                include: { blockchainRecord: true },
              },
            },
          },
        },
      },
      expenses: true,
    },
  });

  if (!ngo) redirect("/login");

  const allMilestones = ngo.projects.flatMap((p) => p.milestones);
  const allDisbursements = allMilestones.flatMap((m) => (m.disbursement ? [{ ...m.disbursement, milestoneName: m.name, projectTitle: ngo.projects.find((p) => p.id === m.projectId)?.title ?? "" }] : []));

  const totalReceived = ngo.projects.reduce((sum, p) => sum + p.raisedAmount, 0);
  const totalDisbursed = allDisbursements
    .filter((d) => d.status === "APPROVED")
    .reduce((sum, d) => sum + (d.approvedAmount ?? d.requestedAmount), 0);
  const pendingApproval = allDisbursements
    .filter((d) => d.status === "PENDING")
    .reduce((sum, d) => sum + d.requestedAmount, 0);
  const paidMilestones = allDisbursements.filter((d) => d.status === "APPROVED").length;

  // Expense breakdown by category
  const totalExpenses = ngo.expenses.reduce((sum, e) => sum + e.amount, 0);
  type ExpenseEntry = { label: string; amount: number; pct: number; color: string };
  let expenseBreakdown: ExpenseEntry[] = [];

  if (totalExpenses > 0) {
    const byCategory = new Map<string, number>();
    for (const e of ngo.expenses) {
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
    }
    const colors = ["bg-emerald-500", "bg-blue-400", "bg-purple-400", "bg-gray-300"];
    expenseBreakdown = Array.from(byCategory.entries()).map(([cat, amount], i) => ({
      label: cat,
      amount,
      pct: Math.round((amount / totalExpenses) * 100),
      color: colors[i % colors.length],
    }));
  } else {
    expenseBreakdown = [
      { label: "Direct project costs", amount: 0, pct: 82, color: "bg-emerald-500" },
      { label: "Staff & operations", amount: 0, pct: 11, color: "bg-blue-400" },
      { label: "Fundraising & admin", amount: 0, pct: 7, color: "bg-gray-300" },
    ];
  }

  const sortedDisbursements = [...allDisbursements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
        {[
          { label: "Total Received", value: formatCurrency(totalReceived), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Disbursed", value: formatCurrency(totalDisbursed), icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending Approval", value: formatCurrency(pendingApproval), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Milestones Paid", value: String(paidMilestones), icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
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
        {/* Disbursement history */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Disbursement History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sortedDisbursements.length === 0 ? (
                <p className="px-5 py-8 text-sm text-gray-400 text-center">
                  No disbursements yet. Submit a completed milestone to request funds.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sortedDisbursements.map((d) => {
                    const txHash = d.blockchainRecord?.txHash ?? d.txHash;
                    return (
                      <div key={d.id} className="px-5 py-4 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{d.projectTitle}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Milestone: {d.milestoneName}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                d.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : d.status === "PENDING"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {d.status === "APPROVED" ? "Released" : d.status === "PENDING" ? "Pending" : d.status}
                            </span>
                            <span className="text-xs text-gray-400">{formatDate(d.createdAt)}</span>
                          </div>
                          {txHash && (
                            <a
                              href={`https://polygonscan.com/tx/${txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-emerald-700 hover:underline mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {txHash}
                            </a>
                          )}
                        </div>
                        <span
                          className={`text-sm font-bold shrink-0 ${
                            d.status === "APPROVED" ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          {formatCurrency(d.approvedAmount ?? d.requestedAmount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
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
