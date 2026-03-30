"use client";
import { useState } from "react";
import { Sparkles, RefreshCw, Clock, Briefcase } from "lucide-react";
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
  source: string;
}

const roleTypeBadge: Record<string, { label: string; color: string }> = {
  VOLUNTEER:          { label: "Volunteer",          color: "bg-emerald-50 text-emerald-700" },
  INTERNSHIP:         { label: "Internship",          color: "bg-blue-50 text-blue-700" },
  CAREER_TRANSITION:  { label: "Career Transition",   color: "bg-violet-50 text-violet-700" },
  INTERIM:            { label: "Interim",             color: "bg-amber-50 text-amber-700" },
};

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)}–${fmt(max)}/yr`;
  if (min) return `From ${fmt(min)}/yr`;
  if (max) return `Up to ${fmt(max)}/yr`;
  return null;
}

export default function SuggestedRolesSection({
  ein,
  initialRoles,
}: {
  ein: string;
  initialRoles: SuggestedRole[];
}) {
  const [roles, setRoles] = useState<SuggestedRole[]>(initialRoles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">
      {/* Header */}
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

      {/* Disclaimer */}
      <div className="px-6 py-3 bg-violet-50/50 border-b border-violet-100">
        <p className="text-xs text-violet-700">
          These roles are AI-generated based on this organisation&apos;s mission, NTEE classification, and financial size. They are not confirmed vacancies — they show the type of professional skills this organisation likely needs. Actual open roles posted by registered GiveLedger NGOs appear on the{" "}
          <Link href="/opportunities" className="underline hover:text-violet-900">Open Roles</Link> page.
        </p>
      </div>

      {error && (
        <p className="px-6 py-3 text-sm text-red-600">{error}</p>
      )}

      {roles.length === 0 && !loading ? (
        <div className="px-6 py-10 text-center">
          <Sparkles className="w-8 h-8 text-violet-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">
            No suggested roles yet. Click &ldquo;Regenerate&rdquo; to have AI analyse this organisation and suggest relevant roles.
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Generate Role Profiles
          </button>
        </div>
      ) : loading ? (
        <div className="px-6 py-10 text-center">
          <RefreshCw className="w-6 h-6 text-violet-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Analysing organisation mission and generating role profiles…</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {roles.map((role) => {
            const badge = roleTypeBadge[role.roleType] ?? { label: role.roleType, color: "bg-gray-100 text-gray-600" };
            const salary = formatSalary(role.salaryMin, role.salaryMax);
            const skillList = role.skills.split(",").map((s) => s.trim()).filter(Boolean);
            return (
              <div key={role.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
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
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {roles.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {roles[0]?.source === "AI" ? "Generated by Groq AI · " : "Template-generated · "}
            Refreshes every 30 days
          </p>
          <Link
            href="/opportunities"
            className="text-xs text-violet-600 hover:text-violet-800 hover:underline font-medium"
          >
            Browse confirmed open roles →
          </Link>
        </div>
      )}
    </div>
  );
}
