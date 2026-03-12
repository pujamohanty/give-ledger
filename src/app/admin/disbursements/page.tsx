"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

type Disbursement = {
  id: string;
  ngo: string;
  project: string;
  milestone: string;
  amount: number;
  requested: string;
  evidence: string[];
  narrative: string;
  outputMetrics: string[];
  status: string;
  txHash: string | null;
};

const initialDisbursements: Disbursement[] = [
  {
    id: "d1",
    ngo: "WaterBridge Kenya",
    project: "Kibera School Water Project",
    milestone: "Installation Phase 2",
    amount: 5000,
    requested: "Mar 9, 2025",
    evidence: ["phase2_photos.zip", "completion_report.pdf"],
    narrative: "Phase 2 installation completed across 5 schools. Water filtration units installed and tested. 2,400 students now have access.",
    outputMetrics: ["2,400 students with clean water", "5 schools covered"],
    status: "PENDING",
    txHash: null,
  },
  {
    id: "d2",
    ngo: "Pragati Foundation",
    project: "Women Vocational Training Bihar",
    milestone: "Cohort 2 training",
    amount: 7500,
    requested: "Mar 6, 2025",
    evidence: ["cohort2_attendance.pdf", "training_photos.pdf"],
    narrative: "Cohort 2 of 45 women completed tailoring and embroidery training. 38 of 45 have already found employment or started micro-businesses.",
    outputMetrics: ["45 women trained", "38 employed/self-employed"],
    status: "PENDING",
    txHash: null,
  },
  {
    id: "d3",
    ngo: "SilverYears Trust",
    project: "Elderly Care Home - Mysore",
    milestone: "Foundation & structure",
    amount: 18700,
    requested: "Mar 4, 2025",
    evidence: ["construction_progress.pdf", "architect_cert.pdf", "photos_march.zip"],
    narrative: "Foundation laid and ground floor structure complete. Construction verified by licensed architect. On schedule for May completion.",
    outputMetrics: ["Foundation complete", "On track for 50 resident capacity"],
    status: "PENDING",
    txHash: null,
  },
  {
    id: "d4",
    ngo: "TechSkills Rwanda",
    project: "Digital Literacy Kigali",
    milestone: "Equipment setup",
    amount: 12000,
    requested: "Feb 25, 2025",
    evidence: ["receipts.pdf", "setup_photos.pdf"],
    narrative: "40 computers installed and configured. Fibre internet connection set up. 3 trainers hired and certified.",
    outputMetrics: ["40 computers installed", "3 trainers hired"],
    status: "APPROVED",
    txHash: "0x7f3a2e1b4c9d8f5e...",
  },
];

export default function AdminDisbursementsPage() {
  const [disbursements, setDisbursements] = useState<Disbursement[]>(initialDisbursements);
  const [acting, setActing] = useState<string | null>(null);

  const handleAction = async (disbursementId: string, action: "APPROVE" | "REJECT") => {
    setActing(disbursementId);
    const mockTxHash = action === "APPROVE"
      ? `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}...`
      : null;
    // Optimistic update
    setDisbursements((prev) =>
      prev.map((d) =>
        d.id === disbursementId
          ? { ...d, status: action === "APPROVE" ? "APPROVED" : "REJECTED", txHash: mockTxHash }
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
      // silently ignore — optimistic update stays
    }
    setActing(null);
  };

  const pending = disbursements.filter((d) => d.status === "PENDING");
  const approved = disbursements.filter((d) => d.status === "APPROVED");

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
          { label: "Pending Approval", value: `$${pending.reduce((s, d) => s + d.amount, 0).toLocaleString()}`, sub: `${pending.length} requests`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Approved (30d)", value: "$24,000", sub: "4 disbursements", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Released", value: "$68,400", sub: "all time", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
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
        <div className="space-y-4">
          {pending.map((d) => (
            <Card key={d.id} className="border-amber-100">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{d.ngo}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {d.project} · Milestone: <strong>{d.milestone}</strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Requested {d.requested}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-700">
                      ${d.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">requested amount</p>
                  </div>
                </div>

                {/* Narrative */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Completion Report
                  </p>
                  <p className="text-sm text-gray-700">{d.narrative}</p>
                </div>

                {/* Output metrics */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {d.outputMetrics.map((m) => (
                    <span key={m} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
                      {m}
                    </span>
                  ))}
                </div>

                {/* Evidence files */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {d.evidence.map((file) => (
                    <button
                      key={file}
                      className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                    >
                      <FileText className="w-3 h-3" />
                      {file}
                    </button>
                  ))}
                </div>

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
      </div>

      {/* Approved */}
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
                      {d.ngo} — {d.milestone}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{d.project}</p>
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
                    <p className="font-bold text-emerald-700">${d.amount.toLocaleString()}</p>
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
    </div>
  );
}
