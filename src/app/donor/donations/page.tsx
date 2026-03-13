import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, DollarSign, TrendingUp, Calendar } from "lucide-react";

export default async function DonationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const donations = await prisma.donation.findMany({
    where: { userId },
    include: {
      project: { include: { ngo: true } },
      blockchainRecord: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const uniqueProjects = new Set(donations.map((d) => d.projectId)).size;

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
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDonated)}</p>
              <p className="text-xs text-gray-500">Total Donated</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{donations.length}</p>
              <p className="text-xs text-gray-500">Transactions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{uniqueProjects}</p>
              <p className="text-xs text-gray-500">Projects Funded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {donations.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-400">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No donations yet — browse projects to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {donations.map((d) => {
                const txHash = d.blockchainRecord?.txHash ?? d.txHash;
                return (
                  <div key={d.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {d.project.title}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-emerald-700 border-emerald-200 bg-emerald-50 text-xs shrink-0"
                          >
                            {d.status === "COMPLETED" ? "Confirmed" : d.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-emerald-700 mb-1">{d.project.ngo.orgName}</p>
                        <p className="text-xs text-gray-400 mb-2">{formatDate(d.createdAt)}</p>
                        {txHash && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400 font-mono truncate max-w-xs">
                              {txHash}
                            </span>
                            <a
                              href={`https://polygonscan.com/tx/${txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-emerald-700 hover:underline shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View on chain
                            </a>
                          </div>
                        )}
                      </div>
                      <span className="text-lg font-bold text-emerald-700 shrink-0">
                        +{formatCurrency(d.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
