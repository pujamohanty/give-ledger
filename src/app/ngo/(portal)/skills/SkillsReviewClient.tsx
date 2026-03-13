"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase, Clock, CheckCircle2, XCircle, ExternalLink,
  ChevronDown, ChevronUp, DollarSign,
} from "lucide-react";

export type SkillOffer = {
  id: string;
  donorName: string | null;
  donorEmail: string;
  projectTitle: string | null;
  skillCategory: string;
  description: string;
  hoursContributed: number | null;
  status: string;
  monetaryValue: number | null;
  txHash: string | null;
  submittedAt: Date;
};

type Props = {
  initialOffers: SkillOffer[];
};

function statusBadge(status: string) {
  if (status === "APPROVED")
    return <Badge className="bg-emerald-100 text-emerald-800 text-xs">Approved</Badge>;
  if (status === "REJECTED")
    return <Badge className="bg-red-100 text-red-700 text-xs">Rejected</Badge>;
  return <Badge className="bg-amber-100 text-amber-800 text-xs">Pending</Badge>;
}

function OfferRow({ offer }: { offer: SkillOffer }) {
  const [status, setStatus] = useState(offer.status);
  const [txHash, setTxHash] = useState(offer.txHash);
  const [monetaryValue, setMonetaryValue] = useState(offer.monetaryValue);
  const [expanded, setExpanded] = useState(false);
  const [valueInput, setValueInput] = useState(offer.monetaryValue?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(action: "APPROVE" | "REJECT") {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/skill/${offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          monetaryValue: action === "APPROVE" && valueInput ? parseFloat(valueInput) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Action failed.");
        return;
      }
      setStatus(data.contribution.status);
      setTxHash(data.contribution.txHash ?? null);
      setMonetaryValue(data.contribution.monetaryValue ?? null);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
            <Briefcase className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {offer.donorName ?? offer.donorEmail}
            </p>
            <p className="text-xs text-gray-500">
              {offer.skillCategory}
              {offer.projectTitle ? ` · ${offer.projectTitle}` : ""}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(offer.submittedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {statusBadge(status)}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
          <p className="text-sm text-gray-700">{offer.description}</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            {offer.hoursContributed && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {offer.hoursContributed}h offered
              </span>
            )}
            {monetaryValue && (
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Valued at ${monetaryValue.toLocaleString()}
              </span>
            )}
          </div>
          {txHash && (
            <a
              href={`https://polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              View on Polygon
            </a>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          {status === "PENDING" && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 max-w-xs">
                <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
                <Input
                  type="number"
                  min="0"
                  placeholder="Monetary value (optional)"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                  onClick={() => handleAction("APPROVE")}
                  disabled={loading}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {loading ? "Processing..." : "Approve & Record On-Chain"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
                  onClick={() => handleAction("REJECT")}
                  disabled={loading}
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}
          {status === "APPROVED" && (
            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approved and recorded on-chain
            </p>
          )}
          {status === "REJECTED" && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              Rejected
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SkillsReviewClient({ initialOffers }: Props) {
  const pending = initialOffers.filter((o) => o.status === "PENDING");
  const approved = initialOffers.filter((o) => o.status === "APPROVED");
  const rejected = initialOffers.filter((o) => o.status === "REJECTED");

  const totalValue = approved.reduce((sum, o) => sum + (o.monetaryValue ?? 0), 0);
  const totalHours = initialOffers.reduce((sum, o) => sum + (o.hoursContributed ?? 0), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Skill Contributions</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review skill and time offers from donors. Approve to record on-chain and assign value.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Offers", value: initialOffers.length.toString() },
          { label: "Pending Review", value: pending.length.toString() },
          { label: "Total Hours Offered", value: totalHours > 0 ? `${totalHours}h` : "—" },
          { label: "Value Recognised", value: totalValue > 0 ? `$${totalValue.toLocaleString()}` : "—" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {initialOffers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No skill offers received yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Donors will appear here once they submit skill contribution offers to your NGO.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {[
            { label: "Pending Review", items: pending },
            { label: "Approved", items: approved },
            { label: "Rejected", items: rejected },
          ]
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <Card key={group.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">
                    {group.label} ({group.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.items.map((offer) => (
                    <OfferRow key={offer.id} offer={offer} />
                  ))}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
