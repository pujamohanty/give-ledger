"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award, CheckCircle2, Briefcase, Users, Heart, Copy, Check, Linkedin, Download,
} from "lucide-react";

export type CredentialData = {
  userId: string;
  userName: string;
  userImage: string | null;
  memberYear: number;
  totalDonated: number;
  uniqueNgoCount: number;
  ngoNames: string[];
  uniqueProjectCount: number;
  completedMilestoneCount: number;
  completedMilestones: Array<{
    projectTitle: string;
    ngoName: string;
    milestoneName: string;
    metrics: string[];
  }>;
  skillCount: number;
  skillCategories: string[];
  skillValue: number;
  campaignCount: number;
  campaignRaised: number;
  endorsementCount: number;
  endorsements: Array<{
    ngoName: string;
    category: string;
    note: string | null;
    endorserName: string | null;
  }>;
};

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "General Recognition",
  FINANCIAL: "Financial Impact",
  SKILL: "Skill Contribution",
  COMMUNITY_IMPACT: "Community Impact",
};

function buildLinkedInText(c: CredentialData, appUrl: string): string {
  const lines: string[] = [];
  lines.push("🏆 GiveLedger Impact Credential");
  lines.push("");
  lines.push(`Issued to: ${c.userName}`);
  lines.push(`Member since: ${c.memberYear}`);
  lines.push(`Profile: ${appUrl}/credential/${c.userId}`);
  lines.push("");
  lines.push("─── FINANCIAL CONTRIBUTIONS ───");
  lines.push(`Total donated: $${c.totalDonated.toLocaleString()}`);
  lines.push(`NGOs supported: ${c.uniqueNgoCount} (${c.ngoNames.slice(0, 3).join(", ")}${c.ngoNames.length > 3 ? ", +" + (c.ngoNames.length - 3) + " more" : ""})`);
  lines.push(`Projects funded: ${c.uniqueProjectCount}`);
  lines.push(`Milestones completed: ${c.completedMilestoneCount} (verified on-chain)`);
  if (c.completedMilestones.length > 0) {
    lines.push("");
    lines.push("Verified outcomes:");
    for (const m of c.completedMilestones.slice(0, 3)) {
      const metric = m.metrics[0] ?? "";
      lines.push(`  • ${m.projectTitle}${metric ? ` → ${metric}` : ""}`);
    }
  }
  if (c.skillCount > 0) {
    lines.push("");
    lines.push("─── SKILL CONTRIBUTIONS ───");
    lines.push(`${c.skillCount} approved contribution${c.skillCount !== 1 ? "s" : ""}`);
    lines.push(`Skills: ${c.skillCategories.join(", ")}`);
    if (c.skillValue > 0) {
      lines.push(`Value recognised by NGOs: $${c.skillValue.toLocaleString()}`);
    }
  }
  if (c.campaignCount > 0) {
    lines.push("");
    lines.push("─── NETWORK MOBILISATION ───");
    lines.push(`Campaigns created: ${c.campaignCount}`);
    if (c.campaignRaised > 0) {
      lines.push(`Funds mobilised from network: $${c.campaignRaised.toLocaleString()}`);
    }
  }
  if (c.endorsementCount > 0) {
    lines.push("");
    lines.push("─── NGO ENDORSEMENTS ───");
    for (const e of c.endorsements.slice(0, 3)) {
      lines.push(`  • ${e.ngoName}: ${CATEGORY_LABELS[e.category] ?? e.category}`);
      if (e.note) lines.push(`    "${e.note}"`);
    }
  }
  lines.push("");
  lines.push("All claims are backed by on-chain records on the Polygon blockchain.");
  lines.push(`Full verifiable credential: ${appUrl}/credential/${c.userId}`);
  return lines.join("\n");
}

type Props = {
  credential: CredentialData;
  isOwner: boolean;
  appUrl: string;
};

export default function CredentialClient({ credential: c, isOwner, appUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false);

  const credentialUrl = `${appUrl}/credential/${c.userId}`;
  const linkedInText = buildLinkedInText(c, appUrl);

  async function copyUrl() {
    await navigator.clipboard.writeText(credentialUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyLinkedIn() {
    await navigator.clipboard.writeText(linkedInText);
    setCopiedLinkedIn(true);
    setTimeout(() => setCopiedLinkedIn(false), 2000);
  }

  const hasContent = c.totalDonated > 0 || c.skillCount > 0 || c.campaignCount > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Verified Contribution Credential</h1>
        <p className="text-sm text-gray-500 mt-1">This is a permanent, verifiable record of everything you have contributed through GiveLedger. Every entry is NGO-confirmed and recorded on Polygon. Unlike a CV line — this cannot be fabricated.</p>
      </div>
      {/* Credential card */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl p-8 text-white mb-8 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <p className="text-emerald-300 text-xs font-medium uppercase tracking-wider">
                GiveLedger Impact Credential
              </p>
              <p className="text-white font-bold text-lg">{c.userName}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-300 text-xs">Member since</p>
            <p className="text-white font-semibold">{c.memberYear}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Donated", value: c.totalDonated > 0 ? `$${c.totalDonated >= 1000 ? (c.totalDonated / 1000).toFixed(0) + "K" : c.totalDonated.toFixed(0)}` : "—" },
            { label: "NGOs", value: c.uniqueNgoCount > 0 ? String(c.uniqueNgoCount) : "—" },
            { label: "Milestones", value: c.completedMilestoneCount > 0 ? String(c.completedMilestoneCount) : "—" },
            { label: "Endorsements", value: c.endorsementCount > 0 ? String(c.endorsementCount) : "—" },
          ].map((stat) => (
            <div key={stat.label} className="text-center bg-white/10 rounded-xl p-3">
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-emerald-300 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {c.totalDonated > 0 && (
            <span className="inline-flex items-center gap-1 bg-emerald-700/50 text-emerald-200 text-xs px-2.5 py-1 rounded-full">
              <Heart className="w-3 h-3" /> Financial Donor
            </span>
          )}
          {c.skillCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-purple-700/50 text-purple-200 text-xs px-2.5 py-1 rounded-full">
              <Briefcase className="w-3 h-3" /> Skill Contributor
            </span>
          )}
          {c.campaignCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-blue-700/50 text-blue-200 text-xs px-2.5 py-1 rounded-full">
              <Users className="w-3 h-3" /> Network Mobiliser
            </span>
          )}
          {c.endorsementCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-amber-700/50 text-amber-200 text-xs px-2.5 py-1 rounded-full">
              <Award className="w-3 h-3" /> NGO Endorsed
            </span>
          )}
          {c.completedMilestoneCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-teal-700/50 text-teal-200 text-xs px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> On-Chain Verified
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-emerald-300">
          <span>All claims verified on Polygon blockchain</span>
          <span>giveledger.com</span>
        </div>
      </div>

      {!hasContent && (
        <Card>
          <CardContent className="py-10 text-center">
            <Award className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No verified contributions yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Make a donation or contribute skills to generate your credential.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail sections */}
      {c.completedMilestones.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Impact ({c.completedMilestoneCount} milestones)
            </h2>
            <div className="space-y-2">
              {c.completedMilestones.slice(0, 5).map((m, i) => (
                <div key={i} className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-700 font-medium">{m.ngoName}</p>
                  <p className="text-sm text-gray-900">{m.milestoneName}</p>
                  {m.metrics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.metrics.slice(0, 2).map((metric, j) => (
                        <span key={j} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {metric}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {c.skillCount > 0 && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              Skill Contributions
            </h2>
            <div className="flex flex-wrap gap-2">
              {c.skillCategories.map((cat) => (
                <Badge key={cat} className="bg-purple-100 text-purple-800">
                  {cat}
                </Badge>
              ))}
            </div>
            {c.skillValue > 0 && (
              <p className="text-sm text-purple-700 font-semibold mt-3">
                ${c.skillValue.toLocaleString()} value recognised by NGOs
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {c.endorsementCount > 0 && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              NGO Endorsements
            </h2>
            <div className="space-y-2">
              {c.endorsements.map((e, i) => (
                <div key={i} className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-xs font-semibold text-emerald-800">
                    {e.ngoName} — {CATEGORY_LABELS[e.category] ?? e.category}
                  </p>
                  {e.note && (
                    <p className="text-xs text-emerald-700 italic mt-0.5">
                      &quot;{e.note}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share / export actions */}
      {(isOwner || hasContent) && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Share &amp; Export Credential</h2>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">Shareable URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 truncate">
                  {credentialUrl}
                </code>
                <Button variant="outline" size="sm" onClick={copyUrl} className="shrink-0">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">LinkedIn / Job Application Text</p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 max-h-48 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{linkedInText}</pre>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyLinkedIn} className="flex items-center gap-2">
                  {copiedLinkedIn ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLinkedIn ? "Copied!" : "Copy for LinkedIn"}
                </Button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(credentialUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0A66C2] text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:opacity-90"
                >
                  <Linkedin className="w-4 h-4" />
                  Open in LinkedIn
                </a>
                <Button variant="outline" size="sm" className="flex items-center gap-2 text-gray-500" onClick={() => window.print()}>
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
