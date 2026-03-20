"use client";
import { useState } from "react";
import { Share2, Check, Users } from "lucide-react";

interface Props {
  initialCount: number;
}

export default function TrainingShareButton({ initialCount }: Props) {
  const [shareCount, setShareCount] = useState(initialCount);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const MAX = 10;
  const remaining = Math.max(0, MAX - shareCount);
  const completed = shareCount >= MAX;

  async function handleShare() {
    const msg = "I'm using GiveLedger's free AI Training Academy — 42+ hours of real-world AI skills for marketing, finance, ops, legal and more. Worth checking out: https://give-ledger.vercel.app/donor/training";
    const url = "https://give-ledger.vercel.app/donor/training";

    // Open share
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "GiveLedger AI Training Academy", text: msg, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(msg).catch(() => {});
    }

    // Track the share
    setSharing(true);
    try {
      const res = await fetch("/api/donor/share-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "training" }),
      });
      if (res.ok) {
        const data = await res.json();
        setShareCount(data.trainingShareCount);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {}
    setSharing(false);
  }

  return (
    <div className="bg-white border border-emerald-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-gray-900">
            {completed ? "Training Advocate — Impact Score boosted!" : `Share with ${remaining} more ${remaining === 1 ? "person" : "people"} to boost your Impact Score`}
          </p>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          {completed
            ? "You've shared with 10+ people. Your Impact Score is now +10 — NGOs reviewing your applications can see this."
            : "Share this free academy with colleagues, friends, or on LinkedIn. Your Impact Score increases with each person you introduce — NGOs view a higher score favourably when reviewing applications."}
        </p>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full max-w-xs">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (shareCount / MAX) * 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">{shareCount}/{MAX} shares</p>
      </div>

      <button
        onClick={handleShare}
        disabled={sharing}
        className="shrink-0 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
      >
        {shared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
        {shared ? "Shared!" : "Share this training"}
      </button>
    </div>
  );
}
