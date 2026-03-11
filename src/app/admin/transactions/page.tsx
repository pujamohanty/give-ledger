import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, Clock, DollarSign, TrendingUp } from "lucide-react";

const transactions = [
  { id: "t01", type: "Donation", user: "Priya S.", email: "priya@email.com", project: "Kibera School Water", ngo: "WaterBridge Kenya", amount: 500, status: "COMPLETED", time: "Mar 10, 2026 · 14:32", txHash: "0x4a3b2c1d5e6f..." },
  { id: "t02", type: "Disbursement", user: "WaterBridge Kenya", email: "info@waterbridge.ke", project: "Kibera School Water", ngo: "WaterBridge Kenya", amount: 5000, status: "PENDING", time: "Mar 10, 2026 · 09:15", txHash: null },
  { id: "t03", type: "Donation", user: "Rahul M.", email: "rahul@email.com", project: "Bihar Vocational Training", ngo: "Pragati Foundation", amount: 200, status: "COMPLETED", time: "Mar 9, 2026 · 22:04", txHash: "0x8f7e6d5c4b3a..." },
  { id: "t04", type: "Donation", user: "Sarah K.", email: "sarah@email.com", project: "Elderly Care Mysore", ngo: "SilverYears Trust", amount: 1000, status: "COMPLETED", time: "Mar 9, 2026 · 11:21", txHash: "0x2c1d3e4f5a6b..." },
  { id: "t05", type: "Disbursement", user: "Pragati Foundation", email: "ops@pragati.org", project: "Bihar Vocational Training", ngo: "Pragati Foundation", amount: 7500, status: "APPROVED", time: "Mar 8, 2026 · 16:45", txHash: "0x9a8b7c6d5e4f..." },
  { id: "t06", type: "Donation", user: "Marcus T.", email: "marcus@email.com", project: "Solar Microgrids Uganda", ngo: "SunPower Africa", amount: 500, status: "COMPLETED", time: "Mar 8, 2026 · 10:08", txHash: "0x3e4f5a6b7c8d..." },
  { id: "t07", type: "Donation", user: "Aisha B.", email: "aisha@email.com", project: "Wheelchair Access Mumbai", ngo: "AccessAbility India", amount: 300, status: "COMPLETED", time: "Mar 7, 2026 · 19:55", txHash: "0x6c7d8e9f0a1b..." },
  { id: "t08", type: "Disbursement", user: "SilverYears Trust", email: "admin@silveryears.in", project: "Elderly Care Mysore", ngo: "SilverYears Trust", amount: 18700, status: "PENDING", time: "Mar 7, 2026 · 08:30", txHash: null },
  { id: "t09", type: "Donation", user: "Meena R.", email: "meena@email.com", project: "Elderly Care Mysore", ngo: "SilverYears Trust", amount: 2000, status: "COMPLETED", time: "Mar 6, 2026 · 17:12", txHash: "0x7a8b9c0d1e2f..." },
  { id: "t10", type: "Disbursement", user: "TechSkills Rwanda", email: "info@techskillsrw.org", project: "Digital Literacy Kigali", ngo: "TechSkills Rwanda", amount: 12000, status: "APPROVED", time: "Mar 5, 2026 · 14:00", txHash: "0x7f3a2e1b4c9d..." },
  { id: "t11", type: "Donation", user: "Anonymous", email: "-", project: "Animal Rescue Nairobi", ngo: "PawsNairobi", amount: 50, status: "COMPLETED", time: "Mar 5, 2026 · 12:30", txHash: "0xb2c3d4e5f6a7..." },
  { id: "t12", type: "Donation", user: "David L.", email: "david@email.com", project: "Elderly Care Mysore", ngo: "SilverYears Trust", amount: 1000, status: "COMPLETED", time: "Mar 4, 2026 · 09:00", txHash: "0xc3d4e5f6a7b8..." },
];

const stats = [
  { label: "Total Volume (30d)", value: "$52,750", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Donations (30d)", value: "84", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Disbursements Pending", value: "3", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Completed Today", value: "6", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
];

const statusStyle: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PENDING: "bg-amber-100 text-amber-700",
};

export default function AdminTransactionsPage() {
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
          <CardTitle className="text-base">All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
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
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle[tx.status]}`}>
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
        </CardContent>
      </Card>
    </div>
  );
}
