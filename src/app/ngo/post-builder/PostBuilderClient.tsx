"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Copy, Check, Instagram } from "lucide-react";

export type MilestonePost = {
  projectTitle: string;
  ngoName: string;
  milestoneName: string;
  narrative: string | null;
  metrics: string[];
  txHash: string | null;
  donorCount: number;
  topDonors: string[];
};

type Props = {
  milestones: MilestonePost[];
  ngoName: string;
};

function buildLinkedInPost(m: MilestonePost, ngoName: string): string {
  const lines: string[] = [];
  lines.push(`We did it. Milestone achieved — and every contributor can verify it on-chain.`);
  lines.push("");
  lines.push(`📌 Project: ${m.projectTitle}`);
  lines.push(`✅ Milestone: "${m.milestoneName}"`);
  if (m.metrics.length > 0) {
    lines.push("");
    lines.push("Outcomes delivered:");
    for (const metric of m.metrics) {
      lines.push(`  → ${metric}`);
    }
  }
  if (m.narrative) {
    lines.push("");
    lines.push(m.narrative);
  }
  if (m.donorCount > 0) {
    lines.push("");
    lines.push(`This milestone was made possible by ${m.donorCount} donor${m.donorCount !== 1 ? "s" : ""}${m.topDonors.length > 0 ? `, including ${m.topDonors.join(", ")}` : ""}.`);
  }
  if (m.txHash) {
    lines.push("");
    lines.push(`On-chain proof: https://polygonscan.com/tx/${m.txHash}`);
  }
  lines.push("");
  lines.push(`Every fund release at ${ngoName} is milestone-locked and recorded on the Polygon blockchain via GiveLedger.`);
  lines.push("");
  lines.push("#GiveLedger #VerifiedImpact #NGO #Transparency #Accountability");
  return lines.join("\n");
}

function buildInstagramCaption(m: MilestonePost, ngoName: string): string {
  const lines: string[] = [];
  lines.push(`Milestone achieved ✅`);
  lines.push("");
  lines.push(`"${m.milestoneName}" — ${m.projectTitle}`);
  lines.push("");
  if (m.metrics.length > 0) {
    for (const metric of m.metrics.slice(0, 2)) {
      lines.push(`📊 ${metric}`);
    }
    lines.push("");
  }
  if (m.donorCount > 0) {
    lines.push(`Made possible by ${m.donorCount} incredible donor${m.donorCount !== 1 ? "s" : ""} 🙏`);
  }
  if (m.narrative) {
    lines.push("");
    lines.push(m.narrative.split(".")[0] + ".");
  }
  lines.push("");
  lines.push("Every fund release is verified and recorded on-chain. Link in bio for proof.");
  lines.push("");
  lines.push("#NGO #ImpactMade #GiveLedger #Verified #Philanthropy #SocialGood #Blockchain #Transparency");
  return lines.join("\n");
}

export default function NgoPostBuilderClient({ milestones, ngoName }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [format, setFormat] = useState<"linkedin" | "instagram">("linkedin");
  const [copied, setCopied] = useState(false);

  const selected = milestones[selectedIdx];

  const post = selected
    ? format === "linkedin"
      ? buildLinkedInPost(selected, ngoName)
      : buildInstagramCaption(selected, ngoName)
    : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (milestones.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Milestone Post Builder</h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate LinkedIn and Instagram posts from your verified milestones.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-gray-500">No completed milestones yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Once a milestone is approved by the GiveLedger team, it will appear here for sharing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Milestone Post Builder</h1>
        <p className="text-gray-500 text-sm mt-1">
          Generate LinkedIn and Instagram posts from your verified milestones. Every claim is backed by on-chain proof.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Milestone selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select a milestone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {milestones.map((m, i) => (
              <button
                key={i}
                onClick={() => setSelectedIdx(i)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                  selectedIdx === i
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${
                    selectedIdx === i ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.milestoneName}</p>
                  <p className="text-xs text-gray-500">{m.projectTitle}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Format selector */}
        <div className="flex gap-3">
          <button
            onClick={() => setFormat("linkedin")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              format === "linkedin"
                ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </button>
          <button
            onClick={() => setFormat("instagram")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              format === "instagram"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </button>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Post Preview</CardTitle>
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
          <Button variant="outline" onClick={handleCopy} className="flex items-center gap-2">
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Post Text"}
          </Button>
          {format === "linkedin" && (
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                `https://polygonscan.com/tx/${selected?.txHash ?? ""}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0A66C2] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90"
            >
              <Linkedin className="w-4 h-4" />
              Open in LinkedIn
            </a>
          )}
        </div>

        <p className="text-xs text-gray-400">
          Copy the post text first, then click &quot;Open in LinkedIn&quot; to paste it as your post body.
        </p>
      </div>
    </div>
  );
}
