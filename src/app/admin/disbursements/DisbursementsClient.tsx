"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, XCircle, Clock, FileText, ExternalLink, AlertTriangle, DollarSign,
} from "lucide-react";

export type DisbursementItem = {
  id: string;
  ngoName: string;
  projectTitle: string;
  milestoneName: string;
  requestedAmount: number;
  approvedAmount: number | null;
  status: string;
  txHash: string | null;
  createdAt: Date;
  narrative: string | null;
  evidenceFiles: { fileName: string; url: string }[];
  outputMarkers: { label: string; value: string; unit: string | null }[];
};

export default function DisbursementsClient({
  initialDisbursements,
}: {
  initialDisbursements: DisbursementItem[];
}) {
  const [disbursements, setDisbursements] = useState<DisbursementItem[]>(initialDisbursements);
  const [acting, setActing] = useState<string | null>(null);

  const handleAction = async (disbursementId: string, action: "APPROVE" | "REJECT") => {
    setActing(disbursementId);
    setDisbursements((prev) =>
      prev.map((d) =>
        d.id === disbursementId
          ? { ...d, status: action === "APPROVE" ? "APPROVED" : "REJECTED" }
          : d
      )
    );
    try {
      await fetch("/api/admin/approve-disbursement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disbursementId, action }),
      });
    } catch {
      // optimistic update stays
    }
    setActing(null);
  };

  function timeLabel(date: Date): string {
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  const pending = disbursements.filter((d) => d.status === "PENDING");
  const approved = disbursements.filter((d) => d.status === "APPROVED");
  const pendingTotal = pending.reduce((s, d) => s + d.requestedAmount, 0);
  const approvedTotal = approved.reduce((s, d) => s + (d.approvedAmount ?? d.requestedAmount), 0);
  const allApprovedTotal = disbursements
    .filter((d) => d.status === "APPROVED")
    .reduce((s, d) => s + (d.approvedAmount ?? d.requestedAmount), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Disbursement Queue</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review milestone evidence and approve fund releases to NGOs.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Pending Approval",
            value: `$${pendingTotal.toLocaleString()}`,
            sub: `${pending.length} requests`,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            label: "Approved (Shown)",
            value: `$${approvedTotal.toLocaleString()}`,
            sub: `${approved.length} disbursements`,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Total Released",
            value: `$${allApprovedTotal.toLocaleString()}`,
            sub: "all time",
            icon: DollarSign,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xs text-gray-400">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending */}
      <div className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" /> Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No pending disbursements — all caught up.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((d) => (
              <Card key={d.id} className="border-amber-100">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{d.ngoName}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {d.projectTitle} · Milestone: <strong>{d.milestoneName}</strong>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Requested {timeLabel(d.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-700">
                        ${d.requestedAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">requested amount</p>
                    </div>
                  </div>

                  {/* Narrative */}
                  {d.narrative && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Completion Report
                      </p>
                      <p className="text-sm text-gray-700">{d.narrative}</p>
                    </div>
                  )}

                  {/* Output metrics */}
                  {d.outputMarkers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {d.outputMarkers.map((m) => (
                        <span
                          key={m.label}
                          className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium"
                        >
                          {m.value} {m.unit ?? ""} {m.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Evidence files */}
                  {d.evidenceFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {d.evidenceFiles.map((file) => (
                        <a
                          key={file.fileName}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                        >
                          <FileText className="w-3 h-3" />
                          {file.fileName}
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-4 flex gap-3">
                    <Button
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                      disabled={acting === d.id}
                      onClick={() => handleAction(d.id, "APPROVE")}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {acting === d.id ? "Processing..." : "Approve & Release Funds"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                      disabled={acting === d.id}
                      onClick={() => handleAction(d.id, "REJECT")}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Escalate
                    </Button>
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Approval triggers an on-chain fund release within 5 minutes.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approved */}
      {approved.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recently Approved
          </h2>
          <div className="space-y-3">
            {approved.map((d) => (
              <Card key={d.id} className="border-emerald-100 bg-emerald-50/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {d.ngoName} — {d.milestoneName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{d.projectTitle}</p>
                      {d.txHash && (
                        <a
                          href={`https://polygonscan.com/tx/${d.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          {d.txHash} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-700">
                        ${(d.approvedAmount ?? d.requestedAmount).toLocaleString()}
                      </p>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Released
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
