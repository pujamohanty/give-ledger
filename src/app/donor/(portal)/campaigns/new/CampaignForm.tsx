"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, DollarSign, Briefcase, CheckCircle2, ChevronRight,
  Users, Clock, Wifi, MapPin, Share2, Copy, Check, Linkedin, MessageCircle, Mail,
  Search, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PlatformShareModal from "@/components/PlatformShareModal";
import type { ProjectForCampaign } from "./page";


function pct(raised: number, goal: number) {
  return goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;
}

function buildShareText(
  campaignTitle: string,
  projectTitle: string,
  roleTitle: string,
  roleId: string,
  origin: string,
) {
  const roleUrl = `${origin}/opportunities/${roleId}`;
  return {
    linkedin: `I'm running a skill campaign for "${projectTitle}" on GiveLedger. They're looking for a ${roleTitle} — this is verified professional experience that goes on your CV and GiveLedger credential, not just volunteering.\n\nApply here: ${roleUrl}`,
    whatsapp: `Hey! I'm running a campaign to get skilled professionals involved in "${projectTitle}". They need a ${roleTitle} — it's recorded as professional experience on your profile. Worth a look: ${roleUrl}`,
    email: `Subject: Help "${projectTitle}" with your ${roleTitle} skills\n\nHi,\n\nI'm putting together a campaign to get skilled people involved in "${projectTitle}" through GiveLedger.\n\nThey specifically need a ${roleTitle}. Your contribution is recorded as verified professional experience — not just volunteering — and goes directly on your GiveLedger credential.\n\nApply here: ${roleUrl}\n\nThanks!`,
  };
}

export default function CampaignForm({ projects }: { projects: ProjectForCampaign[] }) {
  const [campaignType, setCampaignType] = useState<"financial" | "skill">("skill");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [form, setForm] = useState({ title: "", description: "", goal: "", daysRunning: "30" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ campaignId: string; title: string; projectTitle: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [shareRoleId, setShareRoleId] = useState<string | null>(null);
  // Project picker modal
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [pickerPage, setPickerPage] = useState(0);
  const PICKER_PAGE_SIZE = 5;

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;
  const openRoles = selectedProject?.roles ?? [];
  const hasRoles = openRoles.length > 0;

  // For skill campaigns: estimated value = selected roles × avg 40h × $50/h
  const estimatedSkillValue = selectedRoleIds.length * 40 * 50;

  function toggleRole(id: string) {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProjectId) return;
    setSubmitting(true);

    const goalAmount =
      campaignType === "skill"
        ? estimatedSkillValue || 1000
        : parseFloat(form.goal);

    const description =
      campaignType === "skill"
        ? `[SKILL CAMPAIGN] ${form.description}\n\nOpen roles: ${selectedRoleIds.join(",")}`
        : form.description;

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description,
        projectId: selectedProjectId,
        goalAmount,
        daysRunning: form.daysRunning,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult({ campaignId: data.campaignId, title: form.title, projectTitle: selectedProject!.title });
    }
    setSubmitting(false);
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "https://give-ledger.vercel.app";

  // ─── Success screen ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${campaignType === "skill" ? "bg-violet-100" : "bg-purple-100"}`}>
            {campaignType === "skill"
              ? <Briefcase className="w-8 h-8 text-violet-600" />
              : <CheckCircle2 className="w-8 h-8 text-purple-600" />
            }
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campaign Created!</h1>
          <p className="text-gray-500 text-sm mb-1">
            <strong>"{result.title}"</strong> is now live for <strong>{result.projectTitle}</strong>.
          </p>
          <p className="text-xs text-gray-400 mb-6">Share it with your network to start collecting contributions.</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-[11px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Campaign link</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-gray-700 flex-1 break-all">
                {origin}/campaigns/{result.campaignId}
              </p>
              <button
                onClick={() => copyText(`${origin}/campaigns/${result.campaignId}`, "link")}
                className="shrink-0 p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                {copied === "link" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/campaigns" className="flex-1">
              <Button variant="outline" className="w-full">View Campaigns</Button>
            </Link>
            <Link href="/donor/dashboard" className="flex-1">
              <Button className="w-full">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────────────────────────
  const canSubmit =
    !!selectedProjectId &&
    !!form.title &&
    !!form.description &&
    (campaignType === "skill" || !!form.goal);

  return (
    <div className="p-6 lg:p-8">
      {/* Back link */}
      <Link href="/donor/dashboard">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-gray-500 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </Link>

      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Start a Campaign</h1>
        <p className="text-sm text-gray-500 mb-6">Mobilise your network — through money or skills. Both count equally on GiveLedger.</p>

        {/* ── Campaign type toggle ─────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What kind of campaign?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCampaignType("financial")}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                campaignType === "financial"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-purple-200"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${campaignType === "financial" ? "bg-purple-100" : "bg-gray-100"}`}>
                <DollarSign className={`w-4.5 h-4.5 ${campaignType === "financial" ? "text-purple-700" : "text-gray-400"}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${campaignType === "financial" ? "text-purple-900" : "text-gray-700"}`}>
                  Financial Campaign
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                  Invite friends to donate money toward a project milestone
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setCampaignType("skill"); setSelectedRoleIds([]); }}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                campaignType === "skill"
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-200 hover:border-violet-200"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${campaignType === "skill" ? "bg-violet-100" : "bg-gray-100"}`}>
                <Briefcase className={`w-4.5 h-4.5 ${campaignType === "skill" ? "text-violet-700" : "text-gray-400"}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${campaignType === "skill" ? "text-violet-900" : "text-gray-700"}`}>
                  Skill Mobilisation
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                  Invite professionals to fill NGO roles — as valuable as cash
                </p>
              </div>
            </button>
          </div>

          {campaignType === "skill" && (
            <div className="mt-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <Briefcase className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-violet-700 leading-relaxed">
                Skill contributions are recorded as verified professional experience on the contributor's GiveLedger credential — equivalent to paid work. The NGO assigns a monetary value to every hour contributed.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Project selection ─────────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Choose a project <span className="text-red-500">*</span>
            </p>
            <p className="text-[11px] text-gray-400 mb-4">
              {campaignType === "skill"
                ? "Browse projects with open roles — your campaign will invite professionals to fill them."
                : "All funds go directly to this project, milestone-locked on GiveLedger."}
            </p>

            {/* Selected project summary or placeholder */}
            {selectedProject ? (
              <div className={`flex items-center gap-3 p-4 rounded-xl border-2 mb-3 ${campaignType === "skill" ? "border-violet-400 bg-violet-50" : "border-purple-400 bg-purple-50"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white ${campaignType === "skill" ? "bg-violet-600" : "bg-purple-600"}`}>
                  {selectedProject.ngoName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{selectedProject.title}</p>
                  <p className="text-[11px] text-gray-500">{selectedProject.ngoName}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-gray-400">{pct(selectedProject.raisedAmount, selectedProject.goalAmount)}% funded</span>
                    {selectedProject.roles.length > 0 && (
                      <span className="text-[10px] text-violet-600 font-medium">{selectedProject.roles.length} open role{selectedProject.roles.length !== 1 ? "s" : ""}</span>
                    )}
                  </div>
                </div>
                <Check className={`w-5 h-5 shrink-0 ${campaignType === "skill" ? "text-violet-500" : "text-purple-500"}`} />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">No project selected yet</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => { setProjectPickerOpen(true); setPickerSearch(""); setExpandedProjectId(null); setPickerPage(0); }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors ${
                campaignType === "skill"
                  ? "border-violet-300 text-violet-700 hover:bg-violet-50"
                  : "border-purple-300 text-purple-700 hover:bg-purple-50"
              }`}
            >
              <Search className="w-4 h-4" />
              {selectedProject ? "Change project" : "Browse all projects"}
            </button>
          </div>

          {/* ── Project picker modal ─────────────────────────────────────────── */}
          {projectPickerOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setProjectPickerOpen(false)} />

              {/* Modal */}
              <div className="relative bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
                  <div>
                    <h2 className="font-bold text-gray-900">Browse Projects</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {campaignType === "skill" ? "Showing projects with open roles" : "All active projects on GiveLedger"}
                    </p>
                  </div>
                  <button onClick={() => setProjectPickerOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b border-gray-100 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects or NGOs…"
                      value={pickerSearch}
                      onChange={(e) => { setPickerSearch(e.target.value); setPickerPage(0); }}
                      className="w-full h-10 rounded-xl border border-gray-200 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Project list */}
                <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
                  {(() => {
                    const filtered = projects.filter((p) => {
                      if (campaignType === "skill" && p.roles.length === 0) return false;
                      if (!pickerSearch.trim()) return true;
                      const q = pickerSearch.toLowerCase();
                      return p.title.toLowerCase().includes(q) || p.ngoName.toLowerCase().includes(q);
                    });
                    const totalPages = Math.ceil(filtered.length / PICKER_PAGE_SIZE);
                    const paginated = filtered.slice(pickerPage * PICKER_PAGE_SIZE, (pickerPage + 1) * PICKER_PAGE_SIZE);
                    return (
                      <>
                        {paginated.length === 0 && (
                          <div className="text-center py-12 text-gray-400">
                            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">
                              {pickerSearch ? "No projects match your search" : "No projects with open roles right now"}
                            </p>
                            {campaignType === "skill" && !pickerSearch && (
                              <p className="text-xs mt-1">Switch to a Financial campaign to see all projects.</p>
                            )}
                          </div>
                        )}
                        {paginated.map((p) => {
                      const fundPct = pct(p.raisedAmount, p.goalAmount);
                      const isExpanded = expandedProjectId === p.id;
                      const isSelected = selectedProjectId === p.id;
                      return (
                        <div key={p.id} className={`rounded-xl border-2 overflow-hidden transition-colors ${isSelected ? (campaignType === "skill" ? "border-violet-400" : "border-purple-400") : "border-gray-200"}`}>
                          {/* Project header row */}
                          <div className="flex items-center gap-3 p-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white ${isSelected ? (campaignType === "skill" ? "bg-violet-600" : "bg-purple-600") : "bg-gray-400"}`}>
                              {p.ngoName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                              <p className="text-[11px] text-gray-500 truncate">{p.ngoName}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                                  <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${fundPct}%` }} />
                                </div>
                                <span className="text-[10px] text-gray-400">{fundPct}% funded</span>
                                {p.roles.length > 0 && (
                                  <span className="text-[10px] font-semibold text-violet-600">{p.roles.length} open role{p.roles.length !== 1 ? "s" : ""}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {p.roles.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedProjectId(isExpanded ? null : p.id)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProjectId(p.id);
                                  setSelectedRoleIds([]);
                                  setProjectPickerOpen(false);
                                }}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                                  isSelected
                                    ? campaignType === "skill" ? "bg-violet-600 text-white" : "bg-purple-600 text-white"
                                    : campaignType === "skill" ? "border border-violet-300 text-violet-700 hover:bg-violet-50" : "border border-purple-300 text-purple-700 hover:bg-purple-50"
                                }`}
                              >
                                {isSelected ? "Selected" : "Select"}
                              </button>
                            </div>
                          </div>

                          {/* Expanded roles */}
                          {isExpanded && p.roles.length > 0 && (
                            <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Open Roles</p>
                              {p.roles.map((role) => (
                                <div key={role.id} className="bg-white border border-gray-200 rounded-xl p-3">
                                  <div className="flex items-start gap-2 flex-wrap">
                                    <p className="text-xs font-semibold text-gray-900 flex-1">{role.title}</p>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 flex-wrap">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {role.timeCommitment}</span>
                                    <span>{role.durationWeeks}w</span>
                                    <span className="flex items-center gap-1">
                                      {role.isRemote ? <><Wifi className="w-3 h-3" /> Remote</> : <><MapPin className="w-3 h-3" /> On-site</>}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-1 truncate">
                                    {role.skillsRequired.split(",").slice(0, 4).map((s) => s.trim()).join(" · ")}
                                  </p>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProjectId(p.id);
                                  setSelectedRoleIds([]);
                                  setProjectPickerOpen(false);
                                }}
                                className={`w-full mt-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                                  campaignType === "skill"
                                    ? "bg-violet-600 hover:bg-violet-700 text-white"
                                    : "bg-purple-600 hover:bg-purple-700 text-white"
                                }`}
                              >
                                Select this project
                              </button>
                            </div>
                          )}
                        </div>
                      );
                        })}

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between pt-2 pb-1">
                            <button
                              type="button"
                              onClick={() => { setPickerPage((p) => Math.max(0, p - 1)); setExpandedProjectId(null); }}
                              disabled={pickerPage === 0}
                              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                            >
                              <ChevronDown className="w-3.5 h-3.5 rotate-90" /> Previous
                            </button>
                            <span className="text-xs text-gray-400">
                              Page {pickerPage + 1} of {totalPages} · {filtered.length} project{filtered.length !== 1 ? "s" : ""}
                            </span>
                            <button
                              type="button"
                              onClick={() => { setPickerPage((p) => Math.min(totalPages - 1, p + 1)); setExpandedProjectId(null); }}
                              disabled={pickerPage >= totalPages - 1}
                              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                            >
                              Next <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ── Skill: Role invitations ─────────────────────────────────────── */}
          {campaignType === "skill" && selectedProject && hasRoles && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-900 mb-1">Which roles do you want to recruit for?</p>
              <p className="text-[11px] text-gray-400 mb-4">
                Select the roles you'll be sharing with your network. Your campaign will generate ready-to-send invite messages for each.
              </p>
              <div className="space-y-2">
                {openRoles.map((role) => {
                  const checked = selectedRoleIds.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        checked ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-violet-200"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${checked ? "border-violet-500 bg-violet-500" : "border-gray-300"}`}>
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{role.title}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {role.timeCommitment}
                          </span>
                          <span>{role.durationWeeks} weeks</span>
                          <span className="flex items-center gap-1">
                            {role.isRemote ? <><Wifi className="w-3 h-3" /> Remote</> : <><MapPin className="w-3 h-3" /> On-site</>}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 truncate">
                          Skills: {role.skillsRequired.split(",").slice(0, 3).map((s) => s.trim()).join(" · ")}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedRoleIds.length > 0 && (
                <div className="mt-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
                  <p className="text-[11px] text-violet-700 font-semibold">
                    {selectedRoleIds.length} role{selectedRoleIds.length !== 1 ? "s" : ""} selected ·{" "}
                    Estimated skill value: <span className="font-bold">${estimatedSkillValue.toLocaleString()}</span>
                    <span className="font-normal"> (based on avg 40h × $50/h per role)</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Campaign details ────────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Campaign title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={
                  campaignType === "skill"
                    ? `e.g. Help ${selectedProject?.ngoName ?? "this NGO"} with your professional skills`
                    : "e.g. Let's fund the final phase of clean water in Kibera"
                }
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Why are you running this campaign? <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-gray-400 mb-2">
                {campaignType === "skill"
                  ? "Tell your network why your professional skills matter here — and what they'll get out of contributing."
                  : "Tell your network why this project matters to you personally."}
              </p>
              <textarea
                required
                rows={4}
                placeholder={
                  campaignType === "skill"
                    ? "I've seen how much this NGO needs professional support. Contributing your skills here gets recorded as verified work experience — not just volunteering..."
                    : "I've seen the impact of this project firsthand. Here's why I think you should support it..."
                }
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {campaignType === "financial" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Fundraising goal (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      required
                      min="100"
                      placeholder="5000"
                      value={form.goal}
                      onChange={(e) => setForm({ ...form, goal: e.target.value })}
                      className="w-full h-11 rounded-xl border border-gray-200 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}
              {campaignType === "skill" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Skill value target</label>
                  <div className="h-11 rounded-xl border border-violet-200 bg-violet-50 px-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-violet-500" />
                    <span className="text-sm font-semibold text-violet-700">
                      ${estimatedSkillValue > 0 ? estimatedSkillValue.toLocaleString() : "—"}
                    </span>
                    <span className="text-[11px] text-violet-400">auto-calculated</span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Run for</label>
                <select
                  value={form.daysRunning}
                  onChange={(e) => setForm({ ...form, daysRunning: e.target.value })}
                  className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {[7, 14, 21, 30, 45, 60].map((d) => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Skill: one-tap invite buttons per role ─────────────────────── */}
          {campaignType === "skill" && selectedRoleIds.length > 0 && form.title && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-violet-600" />
                Invite your network — one tap per platform
              </p>
              <p className="text-[11px] text-gray-400 mb-4">
                Each button opens the app with your invite message pre-filled. Just tap Send.
              </p>
              <div className="space-y-3">
                {selectedRoleIds.slice(0, 3).map((roleId) => {
                  const role = openRoles.find((r) => r.id === roleId);
                  if (!role) return null;
                  const msgs = buildShareText(form.title, selectedProject!.title, role.title, roleId, origin);
                  const roleUrl = `${origin}/opportunities/${roleId}`;
                  const liUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(roleUrl)}&title=${encodeURIComponent(role.title)}&summary=${encodeURIComponent(msgs.linkedin)}&source=GiveLedger`;
                  const waUrl = `https://wa.me/?text=${encodeURIComponent(msgs.whatsapp)}`;
                  const mailUrl = `mailto:?subject=${encodeURIComponent(`Skill opportunity: ${role.title}`)}&body=${encodeURIComponent(msgs.email)}`;
                  return (
                    <div key={roleId} className="border border-violet-100 rounded-xl overflow-hidden">
                      <div className="bg-violet-50 px-4 py-2.5 flex items-center justify-between">
                        <p className="text-xs font-semibold text-violet-800">{role.title}</p>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShareRoleId(roleId)}
                            className="text-[10px] text-violet-600 underline hover:text-violet-800"
                          >
                            preview
                          </button>
                        </div>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-3 gap-2">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                        <a
                          href={liUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 bg-[#0A66C2] hover:bg-[#0958a8] text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                        >
                          <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                        </a>
                        <a
                          href={mailUrl}
                          className="flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" /> Email
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Full share modal for previewing per-role message */}
              {shareRoleId && (() => {
                const role = openRoles.find((r) => r.id === shareRoleId);
                if (!role) return null;
                const msgs = buildShareText(form.title, selectedProject!.title, role.title, shareRoleId, origin);
                return (
                  <PlatformShareModal
                    open={true}
                    onClose={() => setShareRoleId(null)}
                    url={`${origin}/opportunities/${shareRoleId}`}
                    title={role.title}
                    text={msgs.linkedin}
                    emailBody={msgs.email}
                    showInvite={true}
                  />
                );
              })()}
            </div>
          )}

          {/* ── Info box ─────────────────────────────────────────────────────── */}
          <div className={`border rounded-xl p-4 text-sm ${campaignType === "skill" ? "bg-violet-50 border-violet-100 text-violet-800" : "bg-purple-50 border-purple-100 text-purple-800"}`}>
            {campaignType === "skill" ? (
              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Skill contributors are verified by the NGO on completion. Their contribution is recorded on-chain and assigned a monetary value — it counts toward the project's impact just like a financial donation.
                </p>
              </div>
            ) : (
              <p className="text-[11px] leading-relaxed">
                All funds raised go directly to the selected project — milestone-locked on GiveLedger. Contributors see the same on-chain proof trail as direct donors.
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className={`w-full gap-2 ${campaignType === "skill" ? "bg-violet-700 hover:bg-violet-800" : "bg-purple-700 hover:bg-purple-800"}`}
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Creating…" : campaignType === "skill" ? "Launch Skill Campaign" : "Launch Financial Campaign"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
