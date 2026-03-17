"use client";

import { useState } from "react";
import CreateChallengeButton from "@/components/CreateChallengeButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase, Clock, CheckCircle2, XCircle, ExternalLink,
  Plus, X, ChevronDown, ChevronUp,
} from "lucide-react";

export type NgoOption = {
  id: string;
  orgName: string;
};

export type SkillRecord = {
  id: string;
  ngoId: string;
  ngoName: string;
  projectTitle: string | null;
  skillCategory: string;
  description: string;
  hoursContributed: number | null;
  status: string;
  monetaryValue: number | null;
  txHash: string | null;
  submittedAt: Date;
  approvedAt: Date | null;
};

type Props = {
  ngos: NgoOption[];
  initialContributions: SkillRecord[];
};

const SKILL_CATEGORIES = [
  "IT",
  "MARKETING",
  "LEGAL",
  "FUNDRAISING",
  "DESIGN",
  "TRAINING",
  "OTHER",
];

const EMPTY_FORM = {
  ngoId: "",
  skillCategory: "",
  description: "",
  hoursContributed: "",
};

function statusBadge(status: string) {
  if (status === "APPROVED")
    return <Badge className="bg-emerald-100 text-emerald-800 text-xs">Approved</Badge>;
  if (status === "REJECTED")
    return <Badge className="bg-red-100 text-red-700 text-xs">Rejected</Badge>;
  return <Badge className="bg-amber-100 text-amber-800 text-xs">Pending</Badge>;
}

export default function SkillsClient({ ngos, initialContributions }: Props) {
  const [contributions, setContributions] = useState<SkillRecord[]>(initialContributions);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!form.ngoId || !form.skillCategory || !form.description.trim()) {
      setError("NGO, skill category, and description are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ngoId: form.ngoId,
          skillCategory: form.skillCategory,
          description: form.description.trim(),
          hoursContributed: form.hoursContributed ? parseFloat(form.hoursContributed) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit.");
        return;
      }
      // Add to local list with the NGO name resolved
      const ngo = ngos.find((n) => n.id === form.ngoId);
      const newRecord: SkillRecord = {
        id: data.contribution.id,
        ngoId: data.contribution.ngoId,
        ngoName: ngo?.orgName ?? "Unknown NGO",
        projectTitle: null,
        skillCategory: data.contribution.skillCategory,
        description: data.contribution.description,
        hoursContributed: data.contribution.hoursContributed,
        status: "PENDING",
        monetaryValue: null,
        txHash: null,
        submittedAt: new Date(data.contribution.submittedAt),
        approvedAt: null,
      };
      setContributions((prev) => [newRecord, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const approved = contributions.filter((c) => c.status === "APPROVED");
  const pending = contributions.filter((c) => c.status === "PENDING");
  const rejected = contributions.filter((c) => c.status === "REJECTED");

  const totalValue = approved.reduce((sum, c) => sum + (c.monetaryValue ?? 0), 0);
  const totalHours = contributions.reduce((sum, c) => sum + (c.hoursContributed ?? 0), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skill Contributions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Contribute your skills and time to NGOs. Verified contributions are recorded on-chain.
          </p>
        </div>
        {!showForm && (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Offer Skills
          </Button>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Contributions", value: contributions.length.toString() },
          { label: "Approved", value: approved.length.toString() },
          { label: "Hours Contributed", value: totalHours > 0 ? `${totalHours}h` : "—" },
          { label: "Recognised Value", value: totalValue > 0 ? `$${totalValue.toLocaleString()}` : "—" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New contribution form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              Offer a Skill Contribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">NGO *</Label>
                <select
                  value={form.ngoId}
                  onChange={(e) => setForm((f) => ({ ...f, ngoId: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">Select an NGO</option>
                  {ngos.map((n) => (
                    <option key={n.id} value={n.id}>{n.orgName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Skill Category *</Label>
                <select
                  value={form.skillCategory}
                  onChange={(e) => setForm((f) => ({ ...f, skillCategory: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">Select a category</option>
                  {SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description *</Label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe what you can offer — e.g. 'I can help design a new website for your NGO using Figma and React.'"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <Label className="text-xs font-medium">Estimated hours (optional)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={form.hoursContributed}
                onChange={(e) => setForm((f) => ({ ...f, hoursContributed: e.target.value }))}
                placeholder="e.g. 10"
                className="h-9 text-sm"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Offer"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                  setError(null);
                }}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contributions list */}
      {contributions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No skill contributions yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Click &quot;Offer Skills&quot; to contribute your expertise to an NGO.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {[
            { label: "Pending Review", items: pending, color: "amber" },
            { label: "Approved", items: approved, color: "emerald" },
            { label: "Rejected", items: rejected, color: "red" },
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
                  {group.items.map((c) => (
                    <div key={c.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Briefcase className="w-4 h-4 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{c.ngoName}</p>
                            <p className="text-xs text-gray-500">
                              {c.skillCategory}
                              {c.projectTitle ? ` · ${c.projectTitle}` : ""}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Submitted {new Date(c.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          {statusBadge(c.status)}
                          {expandedId === c.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {expandedId === c.id && (
                        <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                          <p className="text-sm text-gray-700">{c.description}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            {c.hoursContributed && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {c.hoursContributed}h offered
                              </span>
                            )}
                            {c.monetaryValue && (
                              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                <CheckCircle2 className="w-3 h-3" /> Valued at ${c.monetaryValue.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {c.txHash && (
                            <a
                              href={`https://polygonscan.com/tx/${c.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View on Polygon
                            </a>
                          )}
                          {c.status === "APPROVED" && (
                            <div className="pt-1 border-t border-gray-100">
                              <CreateChallengeButton
                                type="skill"
                                ngoId={c.ngoId}
                                ngoName={c.ngoName}
                                skillCategory={c.skillCategory}
                                hoursContributed={c.hoursContributed ?? undefined}
                              />
                            </div>
                          )}
                          {c.status === "REJECTED" && (
                            <div className="flex items-center gap-1.5 text-xs text-red-600">
                              <XCircle className="w-3.5 h-3.5" />
                              This offer was not accepted by the NGO.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
