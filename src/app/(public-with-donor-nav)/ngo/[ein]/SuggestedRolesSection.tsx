"use client";
import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Clock, Briefcase, Bot, Zap } from "lucide-react";
import Link from "next/link";

interface SuggestedRole {
  id: string;
  title: string;
  description: string;
  skills: string;
  roleType: string;
  timeCommitment: string;
  salaryMin: number | null;
  salaryMax: number | null;
  isAiAugmented: boolean;
  aiTools: string | null;
  source: string;
}

const roleTypeBadge: Record<string, { label: string; color: string }> = {
  VOLUNTEER:          { label: "Volunteer",         color: "bg-emerald-50 text-emerald-700" },
  INTERNSHIP:         { label: "Internship",         color: "bg-blue-50 text-blue-700" },
  CAREER_TRANSITION:  { label: "Career Transition",  color: "bg-violet-50 text-violet-700" },
  INTERIM:            { label: "Interim",            color: "bg-amber-50 text-amber-700" },
};

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}/yr`;
  if (min) return `From ${fmt(min)}/yr`;
  if (max) return `Up to ${fmt(max)}/yr`;
  return null;
}

function RoleCard({ role }: { role: SuggestedRole }) {
  const badge = roleTypeBadge[role.roleType] ?? { label: role.roleType, color: "bg-gray-100 text-gray-600" };
  const salary = formatSalary(role.salaryMin, role.salaryMax);
  const skillList = role.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const aiToolList = role.aiTools ? role.aiTools.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">{role.title}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
            {badge.label}
          </span>
          {salary && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
              {salary}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
          <Clock className="w-3 h-3" />
          {role.timeCommitment}
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-2.5 leading-relaxed">{role.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {skillList.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            <Briefcase className="w-2.5 h-2.5 text-gray-400" />
            {skill}
          </span>
        ))}
      </div>
      {aiToolList.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {aiToolList.map((tool) => (
            <span key={tool} className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
              <Bot className="w-2.5 h-2.5" />
              {tool}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleSkeleton() {
  return (
    <div className="px-6 py-4 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="w-14 h-3 bg-gray-100 rounded mt-1" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-full mb-1" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  );
}

export default function SuggestedRolesSection({
  ein,
  initialRoles,
}: {
  ein: string;
  initialRoles: SuggestedRole[];
}) {
  const [roles, setRoles] = useState<SuggestedRole[]>(initialRoles);
  const [loading, setLoading] = useState(initialRoles.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate on first visit if no cached roles
  useEffect(() => {
    if (initialRoles.length === 0) {
      generate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const standardRoles = roles.filter((r) => !r.isAiAugmented);
  const aiRoles = roles.filter((r) => r.isAiAugmented);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ngo/suggest-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ein }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json() as { roles: SuggestedRole[] };
      setRoles(data.roles);
    } catch {
      setError("Could not generate roles right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = roles.length === 0 && !loading;

  return (
    <div className="space-y-4">

      {/* Standard Suggested Roles */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-violet-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <h2 className="text-base font-bold text-gray-900">AI-Suggested Potential Roles</h2>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Generating…" : "Regenerate"}
          </button>
        </div>

        <div className="px-6 py-3 bg-violet-50/50 border-b border-violet-100">
          <p className="text-xs text-violet-700">
            AI-generated based on this organisation&apos;s NTEE mission classification and financial size. Not confirmed vacancies —
            they show the type of skills this org likely needs.{" "}
            <Link href="/opportunities" className="underline hover:text-violet-900">See confirmed open roles</Link>.
          </p>
        </div>

        {error && <p className="px-6 py-3 text-sm text-red-600">{error}</p>}

        {loading ? (
          <div>
            <div className="px-6 py-3 flex items-center gap-2 border-b border-violet-50">
              <RefreshCw className="w-3 h-3 text-violet-400 animate-spin" />
              <p className="text-xs text-violet-600">Analysing organisation and generating role profiles…</p>
            </div>
            <div className="divide-y divide-gray-50">
              {[...Array(4)].map((_, i) => <RoleSkeleton key={i} />)}
            </div>
          </div>
        ) : isEmpty ? (
          <div className="px-6 py-10 text-center">
            <Sparkles className="w-8 h-8 text-violet-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">
              Could not generate roles. Try again below.
            </p>
            <button
              onClick={generate}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {standardRoles.map((role) => <RoleCard key={role.id} role={role} />)}
          </div>
        )}

        {roles.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {roles[0]?.source === "AI" ? "Generated by Groq AI · " : "Template-generated · "}
              Refreshes every 30 days
            </p>
            <Link href="/opportunities" className="text-xs text-violet-600 hover:text-violet-800 hover:underline font-medium">
              Browse confirmed open roles →
            </Link>
          </div>
        )}
      </div>

      {/* AI-Augmented Universal Skill Roles */}
      {(aiRoles.length > 0 || isEmpty) && !loading && (
        <div className="bg-gradient-to-br from-indigo-950 to-violet-950 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">New role type</p>
                <h2 className="text-base font-bold text-white">AI-Augmented Universal Skill Roles</h2>
              </div>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              These roles are designed for people who use AI tools — Claude, Gemini, ChatGPT — to work across domain boundaries.
              No specialist credentials required. If you can direct an AI model effectively and apply critical judgement to its output,
              you qualify. Every completed engagement is NGO-verified and recorded on your GiveLedger Credential.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Fully remote", "Flexible hours", "No prior specialism needed", "AI-fluency is the qualification"].map((tag) => (
                <span key={tag} className="text-[10px] bg-white/10 text-indigo-200 px-2.5 py-1 rounded-full border border-white/10">
                  <Zap className="w-2.5 h-2.5 inline mr-1" />{tag}
                </span>
              ))}
            </div>
          </div>

          {aiRoles.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-indigo-300 mb-4">
                Generate AI-Augmented role profiles for this organisation using the Regenerate button above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {aiRoles.map((role) => {
                const badge = roleTypeBadge[role.roleType] ?? { label: role.roleType, color: "" };
                const skillList = role.skills.split(",").map((s) => s.trim()).filter(Boolean);
                const aiToolList = role.aiTools ? role.aiTools.split(",").map((s) => s.trim()).filter(Boolean) : [];
                return (
                  <div key={role.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{role.title}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/10 text-indigo-200">
                          {badge.label}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                          <Bot className="w-2.5 h-2.5" /> AI-Augmented
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-indigo-400 shrink-0">
                        <Clock className="w-3 h-3" />
                        {role.timeCommitment}
                      </div>
                    </div>
                    <p className="text-xs text-indigo-200 mb-2.5 leading-relaxed">{role.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {skillList.map((skill) => (
                        <span key={skill} className="text-[10px] bg-white/10 text-indigo-200 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                    {aiToolList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] text-indigo-400 self-center">Use:</span>
                        {aiToolList.map((tool) => (
                          <span key={tool} className="text-[10px] bg-indigo-500/30 text-indigo-100 border border-indigo-400/30 px-2 py-0.5 rounded-full font-semibold">
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-[11px] text-indigo-400">
              AI fluency + critical thinking = the new universal professional credential
            </p>
            <Link
              href="/opportunities?augmented=true"
              className="text-[11px] text-indigo-300 hover:text-white font-medium hover:underline"
            >
              See all AI-Augmented roles →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
