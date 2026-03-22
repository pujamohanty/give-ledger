"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface Props {
  message: string;
  url: string;
}

export default function DashboardShareButton({ message, url }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const text = `${message} ${url}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "GiveLedger", text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      title="Share"
      className="w-7 h-7 bg-white/20 hover:bg-white/35 rounded-lg flex items-center justify-center transition-colors shrink-0"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-white" />
        : <Share2 className="w-3.5 h-3.5 text-white" />
      }
    </button>
  );
}
