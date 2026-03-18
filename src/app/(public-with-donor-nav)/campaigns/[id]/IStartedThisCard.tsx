"use client";

import { useState } from "react";
import { Linkedin, Copy, Check } from "lucide-react";

type Props = {
  postText: string;
  raisedAmount: number;
  contributorCount: number;
  campaignId: string;
  appUrl: string;
};

export default function IStartedThisCard({
  postText,
  raisedAmount,
  contributorCount,
  campaignId,
  appUrl,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(postText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
      <h2 className="font-bold text-purple-900 mb-1 flex items-center gap-2 text-lg">
        🏆 You Started This
      </h2>
      <p className="text-sm text-purple-800 mb-4">
        You mobilised ${raisedAmount.toLocaleString()} from {contributorCount} people. Share your story.
      </p>
      <div className="bg-white rounded-lg p-4 border border-purple-100 mb-4">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
          {postText}
        </pre>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy Text"}
        </button>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            `${appUrl}/campaigns/${campaignId}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#0A66C2] text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Linkedin className="w-4 h-4" />
          Share on LinkedIn
        </a>
      </div>
    </div>
  );
}
