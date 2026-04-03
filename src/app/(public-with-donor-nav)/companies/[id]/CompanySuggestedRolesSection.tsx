"use client";

import { useState, useEffect } from "react";
import { Briefcase, RefreshCw, DollarSign, Clock, ChevronDown, ChevronUp, Cpu } from "lucide-react";
import OutreachDrawer from "@/components/OutreachDrawer";
import type { OutreachTarget, OutreachCandidate, ExistingOutreach } from "@/components/OutreachDrawer";

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

type OutreachProps = {
  targetBase: Omit<OutreachTarget, "roleTitles"> | null;
  candidate: OutreachCandidate | null;
  existing: ExistingOutreach;
};

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}/yr`;
  if (min) return `${fmt(min)}+/yr`;
  if (max) return `Up to ${fmt(max)}/yr`;
  return null;
}

function RoleCard({
  role, outreach,
}: {
  role: SuggestedRole;
  outreach: OutreachProps;
}) {
  const [open, setOpen] = useState(false);
  const salary = formatSalary(role.salaryMin, role.salaryMax);
  const skills = role.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const aiTools = role.aiTools?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];

  // Build a role-specific target: only this role's title in roleTitles
  const target: OutreachTarget | null = outreach.targetBase
    ? { ...outreach.targetBase, roleTitles: [role.title] }
    : null;

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
            <div className="mt-2 mb-3">
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
            <div className="mb-3 p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <p className="text-[10px] text-indigo-200 leading-relaxed">
                No specialist background required. AI fluency is the core qualification. Apply with your GiveLedger credential to show verified AI training.
              </p>
            </div>
          )}

          {/* Role-specific Express Interest */}
          {target && (
            <div className={`pt-3 border-t ${role.isAiAugmented ? "border-indigo-800/40" : "border-gray-100"}`}>
              <OutreachDrawer
                target={target}
                candidate={outreach.candidate}
                existing={outreach.existing}
                compact
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RoleSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="w-4 h-4 bg-gray-100 rounded mt-0.5" />
      </div>
    </div>
  );
}

type Props = {
  companyId: string;
  initialRoles: SuggestedRole[];
  outreach: OutreachProps;
};

export default function CompanySuggestedRolesSection({ companyId, initialRoles, outreach }: Props) {
  const [roles, setRoles] = useState<SuggestedRole[]>(initialRoles);
  const [loading, setLoading] = useState(initialRoles.length === 0);

  const standardRoles = roles.filter((r) => !r.isAiAugmented);
  const aiRoles = roles.filter((r) => r.isAiAugmented);

  async function generate() {
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

  // Auto-generate on first visit if no cached roles exist
  useEffect(() => {
    if (initialRoles.length === 0) {
      generate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-500" />
          AI-Suggested Roles
          {!loading && <span className="text-xs font-normal text-gray-400">({roles.length} roles)</span>}
        </h2>
        {!loading && roles.length > 0 && (
          <button
            onClick={generate}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 mb-3 flex items-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
            Analysing company profile and generating role suggestions…
          </p>
          {[...Array(5)].map((_, i) => <RoleSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-6">
          {standardRoles.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Standard Roles</p>
              <div className="space-y-2">
                {standardRoles.map((r) => <RoleCard key={r.id} role={r} outreach={outreach} />)}
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
                {aiRoles.map((r) => <RoleCard key={r.id} role={r} outreach={outreach} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
