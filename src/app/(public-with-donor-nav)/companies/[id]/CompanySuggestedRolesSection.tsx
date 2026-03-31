"use client";

import { useState } from "react";
import { Briefcase, Sparkles, RefreshCw, DollarSign, Clock, ChevronDown, ChevronUp, Cpu } from "lucide-react";

type SuggestedRole = {
  id: string;
  title: string;
  description: string;
  skills: string;
  timeCommitment: string;
  salaryMin: number | null;
  salaryMax: number | null;
  isAiAugmented: boolean;
  aiTools: string | null;
  source: string;
};

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}/yr`;
  if (min) return `${fmt(min)}+/yr`;
  if (max) return `Up to ${fmt(max)}/yr`;
  return null;
}

function RoleCard({ role }: { role: SuggestedRole }) {
  const [open, setOpen] = useState(false);
  const salary = formatSalary(role.salaryMin, role.salaryMax);
  const skills = role.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const aiTools = role.aiTools?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  return (
    <div
      className={`rounded-xl border transition-all duration-150 overflow-hidden ${
        role.isAiAugmented
          ? "border-indigo-200 bg-gradient-to-br from-indigo-950 to-violet-950"
          : "border-gray-100 bg-white"
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-4 flex items-start justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-sm font-semibold ${role.isAiAugmented ? "text-white" : "text-gray-900"}`}>
              {role.title}
            </span>
            {role.isAiAugmented && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-500/30">
                <Cpu className="w-2.5 h-2.5" /> AI-Augmented
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className={`flex items-center gap-1 ${role.isAiAugmented ? "text-indigo-300" : "text-gray-400"}`}>
              <Clock className="w-3 h-3" /> {role.timeCommitment}
            </span>
            {salary && (
              <span className={`flex items-center gap-1 font-semibold ${role.isAiAugmented ? "text-emerald-300" : "text-emerald-600"}`}>
                <DollarSign className="w-3 h-3" /> {salary}
              </span>
            )}
          </div>
        </div>
        {open
          ? <ChevronUp className={`w-4 h-4 shrink-0 mt-0.5 ${role.isAiAugmented ? "text-indigo-300" : "text-gray-400"}`} />
          : <ChevronDown className={`w-4 h-4 shrink-0 mt-0.5 ${role.isAiAugmented ? "text-indigo-300" : "text-gray-400"}`} />
        }
      </button>

      {open && (
        <div className={`px-4 pb-4 border-t ${role.isAiAugmented ? "border-indigo-800/40" : "border-gray-50"}`}>
          <p className={`text-xs leading-relaxed mt-3 mb-3 ${role.isAiAugmented ? "text-indigo-200" : "text-gray-600"}`}>
            {role.description}
          </p>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {skills.map((s) => (
                <span
                  key={s}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    role.isAiAugmented
                      ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/30"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {role.isAiAugmented && aiTools.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">AI Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {aiTools.map((t) => (
                  <span key={t} className="text-[10px] font-bold bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/20">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {role.isAiAugmented && (
            <div className="mt-3 p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <p className="text-[10px] text-indigo-200 leading-relaxed">
                No specialist background required. AI fluency is the core qualification. Apply with your GiveLedger credential to show verified AI training.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Props = {
  companyId: string;
  initialRoles: SuggestedRole[];
};

export default function CompanySuggestedRolesSection({ companyId, initialRoles }: Props) {
  const [roles, setRoles] = useState<SuggestedRole[]>(initialRoles);
  const [loading, setLoading] = useState(false);

  const standardRoles = roles.filter((r) => !r.isAiAugmented);
  const aiRoles = roles.filter((r) => r.isAiAugmented);

  async function regenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/companies/suggest-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      if (res.ok) {
        const data = await res.json() as { roles: SuggestedRole[] };
        setRoles(data.roles);
      }
    } finally {
      setLoading(false);
    }
  }

  if (roles.length === 0 && !loading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-500" />
            AI-Suggested Roles
          </h2>
        </div>
        <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
          <Sparkles className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-3">No role suggestions generated yet</p>
          <button
            onClick={regenerate}
            className="inline-flex items-center gap-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate AI Role Suggestions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-500" />
          AI-Suggested Roles
          <span className="text-xs font-normal text-gray-400">({roles.length} roles)</span>
        </h2>
        <button
          onClick={regenerate}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Generating role suggestions...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {standardRoles.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Standard Roles</p>
              <div className="space-y-2">
                {standardRoles.map((r) => <RoleCard key={r.id} role={r} />)}
              </div>
            </div>
          )}

          {aiRoles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">AI-Augmented Roles</p>
                <span className="text-[10px] text-indigo-300 bg-indigo-950/50 border border-indigo-800/40 px-2 py-0.5 rounded-full">
                  No specialist degree required
                </span>
              </div>
              <div className="space-y-2">
                {aiRoles.map((r) => <RoleCard key={r.id} role={r} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
