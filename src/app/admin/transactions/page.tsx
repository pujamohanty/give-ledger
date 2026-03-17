import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, Clock, DollarSign, TrendingUp } from "lucide-react";

const statusStyle: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PENDING: "bg-amber-100 text-amber-700",
};

function formatTime(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminTransactionsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/login");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [donations, disbursements] = await Promise.all([
    prisma.donation.findMany({
      include: {
        user: { select: { name: true, email: true } },
        project: { include: { ngo: { select: { orgName: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.disbursement.findMany({
      include: {
        milestone: {
          include: {
            project: { include: { ngo: { select: { orgName: true } } } },
          },
        },
        blockchainRecord: { select: { txHash: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  type TxRow = {
    id: string;
    type: "Donation" | "Disbursement";
    user: string;
    email: string;
    project: string;
    ngo: string;
    amount: number;
    status: string;
    time: string;
    txHash: string | null;
    createdAt: Date;
  };

  const donationRows: TxRow[] = donations.map((d) => ({
    id: d.id,
    type: "Donation",
    user: d.user?.name ?? "Anonymous",
    email: d.user?.email ?? "—",
    project: d.project.title,
    ngo: d.project.ngo.orgName,
    amount: d.amount,
    status: "COMPLETED",
    time: formatTime(d.createdAt),
    txHash: d.txHash ?? null,
    createdAt: d.createdAt,
  }));

  const disbursementRows: TxRow[] = disbursements.map((d) => ({
    id: d.id,
    type: "Disbursement",
    user: d.milestone.project.ngo.orgName,
    email: "—",
    project: d.milestone.project.title,
    ngo: d.milestone.project.ngo.orgName,
    amount: d.requestedAmount,
    status: d.status,
    time: formatTime(d.createdAt),
    txHash: d.blockchainRecord?.txHash ?? d.txHash ?? null,
    createdAt: d.createdAt,
  }));

  const allTxs = [...donationRows, ...disbursementRows].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  // Compute real stats
  const volumeLast30 = donations
    .filter((d) => new Date(d.createdAt) >= thirtyDaysAgo)
    .reduce((sum, d) => sum + d.amount, 0);
  const donationsLast30 = donations.filter((d) => new Date(d.createdAt) >= thirtyDaysAgo).length;
  const pendingDisbursements = disbursements.filter((d) => d.status === "PENDING").length;
  const completedToday = donations.filter((d) => new Date(d.createdAt) >= todayStart).length;

  const stats = [
    { label: "Total Volume (30d)", value: `$${volumeLast30.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Donations (30d)", value: String(donationsLast30), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Disbursements Pending", value: String(pendingDisbursements), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Donations Today", value: String(completedToday), icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-gray-600" /> Transaction Log
        </h1>
        <p className="text-gray-500 text-sm mt-1">Full audit trail of all donations and disbursements on the platform.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Transactions ({allTxs.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {allTxs.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Type</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">User / NGO</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Project</th>
                    <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Amount</th>
                    <th className="text-center px-5 py-3 text-xs text-gray-500 font-medium">Status</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Tx Hash</th>
                    <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allTxs.map((tx) => (
                    <tr key={`${tx.type}-${tx.id}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tx.type === "Donation" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-gray-900 font-medium">{tx.user}</p>
                        <p className="text-xs text-gray-400">{tx.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-gray-700 text-xs">{tx.project}</p>
                        <p className="text-xs text-emerald-700">{tx.ngo}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900">
                        ${tx.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle[tx.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {tx.txHash ? (
                          <a href={`https://polygonscan.com/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline font-mono">
                            {tx.txHash.slice(0, 16)}...
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-gray-400 whitespace-nowrap">{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
