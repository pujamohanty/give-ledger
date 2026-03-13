"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";

export default function ShareCampaignButton({ campaignId, title }: { campaignId: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/campaigns/${campaignId}`;
    const text = `Support this campaign: "${title}" — every dollar is milestone-locked and verified on-chain. ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // fall through to clipboard copy
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full gap-2"
      onClick={handleShare}
    >
      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
      {copied ? "Link Copied!" : "Share This Campaign"}
    </Button>
  );
}
