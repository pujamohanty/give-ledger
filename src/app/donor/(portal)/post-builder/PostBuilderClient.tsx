"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Copy, Check, RefreshCw } from "lucide-react";

export type PostData = {
  donorName: string;
  totalDonated: number;
  projectsCount: number;
  ngosCount: number;
  completedMilestones: Array<{
    projectTitle: string;
    ngoName: string;
    milestoneName: string;
    metrics: string[];
    txHash: string | null;
  }>;
  approvedSkills: Array<{ skillCategory: string; ngoName: string }>;
  endorsements: Array<{ ngoName: string; category: string; note: string | null }>;
  campaigns: Array<{ title: string; raisedAmount: number }>;
  userId: string;
};

function buildLinkedInPost(data: PostData, style: "professional" | "story" | "impact"): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://give-ledger.vercel.app";

  if (style === "professional") {
    const lines: string[] = [];
    lines.push(`In ${new Date().getFullYear()}, I committed to making my giving count. Here's the verified trail:`);
    lines.push("");
    lines.push(`💰 $${data.totalDonated.toLocaleString()} donated across ${data.projectsCount} project${data.projectsCount !== 1 ? "s" : ""} and ${data.ngosCount} NGO${data.ngosCount !== 1 ? "s" : ""}`);
    if (data.completedMilestones.length > 0) {
      lines.push(`✅ ${data.completedMilestones.length} verified milestone${data.completedMilestones.length !== 1 ? "s" : ""} completed`);
    }
    if (data.approvedSkills.length > 0) {
      lines.push(`🔧 ${data.approvedSkills.length} skill contribution${data.approvedSkills.length !== 1 ? "s" : ""} approved by NGOs`);
    }
    if (data.campaigns.length > 0) {
      const totalRaised = data.campaigns.reduce((s, c) => s + c.raisedAmount, 0);
      if (totalRaised > 0) {
        lines.push(`🤝 $${totalRaised.toLocaleString()} mobilised from my network through fundraising campaigns`);
      }
    }
    lines.push("");
    lines.push("What makes this different? Every donation is milestone-locked. Funds only release when NGOs deliver and GiveLedger verifies — then it's recorded on the Polygon blockchain.");
    if (data.completedMilestones.length > 0) {
      lines.push("");
      lines.push("Real outcomes from my donations:");
      for (const m of data.completedMilestones.slice(0, 3)) {
        const metric = m.metrics[0] ?? "";
        lines.push(`▸ ${m.projectTitle} (${m.ngoName})${metric ? ` — ${metric}` : ""}`);
      }
    }
    if (data.endorsements.length > 0) {
      lines.push("");
      lines.push(`Recognised by ${data.endorsements.length} NGO${data.endorsements.length !== 1 ? "s" : ""} for my contributions.`);
      if (data.endorsements[0].note) {
        lines.push(`"${data.endorsements[0].note}" — ${data.endorsements[0].ngoName}`);
      }
    }
    lines.push("");
    lines.push(`Full verified impact record: ${appUrl}/donor/${data.userId}/impact`);
    lines.push("");
    lines.push("#GiveLedger #ImpactInvesting #Philanthropy #VerifiedImpact #Transparency");
    return lines.join("\n");
  }

  if (style === "story") {
    const lines: string[] = [];
    lines.push("I used to wonder: where does my donation actually go?");
    lines.push("");
    lines.push("Now I have an answer. Every dollar I give is milestone-locked. NGOs can only access funds after they deliver real, verified outcomes.");
    lines.push("");
    if (data.completedMilestones.length > 0) {
      const m = data.completedMilestones[0];
      lines.push(`The most recent result: ${m.projectTitle} by ${m.ngoName}`);
      lines.push(`→ Milestone completed: "${m.milestoneName}"`);
      if (m.metrics.length > 0) {
        lines.push(`→ Outcome: ${m.metrics[0]}`);
      }
      if (m.txHash) {
        lines.push(`→ Proof: recorded on the Polygon blockchain`);
      }
    }
    lines.push("");
    lines.push(`To date: $${data.totalDonated.toLocaleString()} donated. ${data.completedMilestones.length} milestones verified. ${data.ngosCount} NGO${data.ngosCount !== 1 ? "s" : ""} supported.`);
    lines.push("");
    lines.push("This is what accountable giving looks like.");
    lines.push("");
    lines.push(`See my full impact record → ${appUrl}/donor/${data.userId}/impact`);
    lines.push("");
    lines.push("#GiveLedger #AccountableGiving #SocialImpact #Transparency");
    return lines.join("\n");
  }

  // impact style
  const lines: string[] = [];
  lines.push(`${new Date().getFullYear()} giving impact — every outcome verified on-chain:`);
  lines.push("");
  if (data.completedMilestones.length > 0) {
    for (const m of data.completedMilestones.slice(0, 4)) {
      const metrics = m.metrics.slice(0, 2).join(", ");
      lines.push(`✅ ${m.projectTitle}: "${m.milestoneName}"${metrics ? ` → ${metrics}` : ""}`);
    }
  } else {
    lines.push("Milestones in progress — updates coming as outcomes are verified.");
  }
  lines.push("");
  lines.push(`$${data.totalDonated.toLocaleString()} · ${data.projectsCount} project${data.projectsCount !== 1 ? "s" : ""} · ${data.ngosCount} NGO${data.ngosCount !== 1 ? "s" : ""}`);
  if (data.approvedSkills.length > 0) {
    lines.push(`+ ${data.approvedSkills.length} skill contribution${data.approvedSkills.length !== 1 ? "s" : ""} approved`);
  }
  lines.push("");
  lines.push(`Verified impact profile → ${appUrl}/donor/${data.userId}/impact`);
  lines.push("");
  lines.push("#GiveLedger #VerifiedImpact #Giving");
  return lines.join("\n");
}

type Props = {
  postData: PostData;
};

const STYLES = [
  { value: "professional" as const, label: "Professional", desc: "Detailed career-focused post" },
  { value: "story" as const, label: "Story", desc: "Narrative-first personal post" },
  { value: "impact" as const, label: "Impact Summary", desc: "Concise data-forward post" },
];

export default function PostBuilderClient({ postData }: Props) {
  const [style, setStyle] = useState<"professional" | "story" | "impact">("professional");
  const [copied, setCopied] = useState(false);

  const post = buildLinkedInPost(postData, style);

  async function handleCopy() {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    `${process.env.NEXT_PUBLIC_APP_URL}/donor/${postData.userId}/impact`
  )}`;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">LinkedIn Post Builder</h1>
        <p className="text-gray-500 text-sm mt-1">
          Generate a LinkedIn post from your verified impact data. Every claim is backed by on-chain proof.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Style selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Choose a post style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                  style === s.value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${
                    style === s.value
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Post Preview</CardTitle>
              <button
                onClick={() => setStyle(style)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {post}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Post Text"}
          </Button>
          <a
            href={linkedInShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0A66C2] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Linkedin className="w-4 h-4" />
            Open in LinkedIn
          </a>
        </div>

        <p className="text-xs text-gray-400">
          Tip: Copy the post text first, then click &quot;Open in LinkedIn&quot; to paste it in as your post body. LinkedIn does not allow pre-filled post text via URL.
        </p>
      </div>
    </div>
  );
}
