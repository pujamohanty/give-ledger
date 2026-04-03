"use client";

import { useState } from "react";
import {
  X, Copy, Check, Send, Bookmark, ExternalLink,
  ChevronDown, AlertCircle, Mail, Linkedin,
} from "lucide-react";

export type OutreachTarget = {
  name: string;
  type: "company" | "ngo";
  id: string;            // companyId or ein
  contactEmail: string | null;
  contactName: string | null;
  sector: string;
  roleTitles: string[];
};

export type OutreachCandidate = {
  name: string;
  jobTitle: string | null;
  credentialUserId: string;
};

export type ExistingOutreach = {
  id: string;
  status: string;
  sentAt: string;        // ISO string
  roleTitleRef: string | null;
} | null;

const STATUS_LABELS: Record<string, string> = {
  SAVED: "Saved to Pipeline",
  REACHED_OUT: "Reached Out",
  RESPONDED: "They Responded",
  IN_CONVERSATION: "In Conversation",
};

type Props = {
  target: OutreachTarget;
  candidate: OutreachCandidate | null;
  existing: ExistingOutreach;
  compact?: boolean;
};

function buildEmail(target: OutreachTarget, candidate: OutreachCandidate | null, role: string): string {
  const greeting = target.contactName ? `Hi ${target.contactName},` : "Hi there,";
  const credUrl = candidate
    ? `https://give-ledger.vercel.app/credential/${candidate.credentialUserId}`
    : "[Your GiveLedger Credential URL]";
  const candidateName = candidate?.name ?? "[Your Name]";
  const titleLine = candidate?.jobTitle ? `, ${candidate.jobTitle}` : "";
  const roleRef = role || "AI-augmented contributor";

  if (target.type === "ngo") {
    return `${greeting}

My name is ${candidateName}${titleLine}. I'm reaching out to express genuine interest in contributing to ${target.name}'s mission.

I recently completed verified professional work through GiveLedger — a platform where contributions to nonprofits are blockchain-recorded and independently verifiable. My credential documents real-world output in a capacity similar to "${roleRef}".

I believe these skills could directly serve ${target.name}'s work. You can review my complete verified contribution record here:
${credUrl}

I'd welcome a brief conversation to explore whether there's a fit. Happy to share more or arrange a call at your convenience.

Warm regards,
${candidateName}`;
  }

  return `${greeting}

My name is ${candidateName}${titleLine}. I'm reaching out to express interest in connecting with ${target.name}.

I recently completed verified professional work in the ${target.sector} space through GiveLedger — a platform that blockchain-records professional contributions to nonprofits. My experience aligns closely with a role like "${roleRef}".

I came across ${target.name} while exploring companies in this space and believe my background could be a strong fit as your team grows.

You can view my verified work record and credential here:
${credUrl}

I'd value a brief conversation if you're open to it. Happy to send more context or arrange a call.

Best regards,
${candidateName}`;
}

export default function OutreachDrawer({ target, candidate, existing, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(target.roleTitles[0] ?? "");
  const [emailBody, setEmailBody] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentExisting, setCurrentExisting] = useState(existing);
  const [statusOpen, setStatusOpen] = useState(false);

  function openDrawer() {
    setEmailBody(buildEmail(target, candidate, selectedRole));
    setOpen(true);
  }

  function handleRoleChange(role: string) {
    setSelectedRole(role);
    setEmailBody(buildEmail(target, candidate, role));
  }

  async function saveContact(status: "SAVED" | "REACHED_OUT") {
    if (!candidate) return;
    setSaving(true);
    try {
      const payload = {
        ...(target.type === "company" ? { companyId: target.id } : { ein: target.id }),
        roleTitleRef: selectedRole || null,
        status,
      };
      const method = currentExisting ? "PATCH" : "POST";
      const url = currentExisting ? `/api/outreach/${currentExisting.id}` : "/api/outreach";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json() as { contact: ExistingOutreach };
        setCurrentExisting(data.contact);
        setOpen(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(status: string) {
    if (!currentExisting) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/outreach/${currentExisting.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json() as { contact: ExistingOutreach };
        setCurrentExisting(data.contact);
      }
    } finally {
      setSaving(false);
      setStatusOpen(false);
    }
  }

  async function copyMessage() {
    await navigator.clipboard.writeText(emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const subject = encodeURIComponent(`Interest in ${target.name} — GiveLedger Credential`);
  const mailtoLink = `mailto:${target.contactEmail ?? ""}?subject=${subject}&body=${encodeURIComponent(emailBody)}`;
  const linkedinSearch = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(target.name + " hiring HR talent")}`;

  // Already contacted — show status badge with dropdown to update
  if (currentExisting) {
    const sentDate = new Date(currentExisting.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return (
      <div className="relative">
        <button
          onClick={() => setStatusOpen((v) => !v)}
          className="flex items-center gap-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          {STATUS_LABELS[currentExisting.status] ?? currentExisting.status} · {sentDate}
          <ChevronDown className="w-3 h-3 ml-0.5" />
        </button>
        {statusOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setStatusOpen(false)} />
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-52 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-50">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Update Status</p>
              </div>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => updateStatus(value)}
                  disabled={saving}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${
                    currentExisting.status === value ? "text-emerald-700 bg-emerald-50" : "text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Not logged in
  if (!candidate) {
    return (
      <a
        href="/login"
        className={compact
          ? "inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          : "inline-flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
        }
      >
        <Send className={compact ? "w-3 h-3" : "w-4 h-4"} />
        Express Interest
      </a>
    );
  }

  return (
    <>
      <button
        onClick={openDrawer}
        className={compact
          ? "inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          : "inline-flex items-center gap-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
        }
      >
        <Send className={compact ? "w-3 h-3" : "w-4 h-4"} />
        Express Interest
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-start justify-between gap-3 z-10">
              <div>
                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-0.5">
                  Proactive Outreach
                </p>
                <h2 className="text-base font-bold text-gray-900 leading-tight">{target.name}</h2>
                <p className="text-xs text-gray-400">{target.sector}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 mt-1 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* Credential preview */}
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-violet-500 uppercase tracking-wider mb-2">You are sharing</p>
                <p className="text-sm font-semibold text-gray-900">{candidate.name}</p>
                {candidate.jobTitle && <p className="text-xs text-gray-500 mt-0.5">{candidate.jobTitle}</p>}
                <a
                  href={`/credential/${candidate.credentialUserId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 mt-1.5 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  View your GiveLedger Credential
                </a>
              </div>

              {/* Role selector */}
              {target.roleTitles.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Reference this role in your message
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {target.roleTitles.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Editable email body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">Your message</label>
                  <span className="text-[10px] text-gray-400">Edit before sending</span>
                </div>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={11}
                  className="w-full text-xs text-gray-700 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono leading-relaxed"
                />
              </div>

              {/* Contact disclaimer */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    {target.contactEmail ? (
                      <>
                        <p className="text-xs font-semibold text-amber-900">
                          Sending to: {target.contactEmail}
                        </p>
                        <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                          {target.type === "company"
                            ? "This is a General Business Contact from SAM.gov — not HR. Use the LinkedIn link below to find the hiring manager if needed."
                            : "This reaches the organisation's registered contact. Use LinkedIn to find the right person if needed."
                          }
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-amber-900">
                        No email on record. Use LinkedIn to find the right contact at {target.name}.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {target.contactEmail && (
                  <a
                    href={mailtoLink}
                    onClick={() => saveContact("REACHED_OUT")}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Open in Email Client
                  </a>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={copyMessage}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium border border-gray-200 hover:bg-gray-50 py-2.5 rounded-xl transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    {copied ? "Copied!" : "Copy Message"}
                  </button>
                  <a
                    href={linkedinSearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    Find on LinkedIn
                  </a>
                </div>
              </div>

              {/* Save without sending */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  onClick={() => saveContact("REACHED_OUT")}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark as Reached Out
                </button>
                <button
                  onClick={() => saveContact("SAVED")}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Save to Pipeline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
