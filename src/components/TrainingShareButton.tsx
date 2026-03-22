"use client";
import { useState } from "react";
import { Share2, Check, Lock, Users, Star, Zap } from "lucide-react";

interface Props {
  initialCount: number;
}

const MILESTONES = [
  {
    at: 3,
    title: "Shared Learner",
    benefit: "+3 Impact Score",
    detail: "NGOs can see your Impact Score when reviewing your application",
    Icon: Users,
    unlocked: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", title: "text-emerald-800", badge: "bg-emerald-100 text-emerald-700" },
  },
  {
    at: 5,
    title: "Community Builder",
    benefit: "+5 Impact Score",
    detail: "A Community Builder badge appears on your application — visible to NGOs",
    Icon: Star,
    unlocked: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", title: "text-blue-800", badge: "bg-blue-100 text-blue-700" },
  },
  {
    at: 10,
    title: "Training Advocate",
    benefit: "+10 Impact Score",
    detail: "Maximum Impact Score from training — priority placement in NGO application queues",
    Icon: Zap,
    unlocked: { bg: "bg-violet-50", border: "border-violet-200", icon: "text-violet-600", title: "text-violet-800", badge: "bg-violet-100 text-violet-700" },
  },
];

export default function TrainingShareButton({ initialCount }: Props) {
  const [shareCount, setShareCount] = useState(initialCount);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);

  const MAX = 10;

  async function handleShare() {
    const msg = "I'm using GiveLedger's free AI Training Academy — 42+ hours of real-world AI skills for marketing, finance, ops, legal and more. Worth checking out: https://give-ledger.vercel.app/donor/training";
    const url = "https://give-ledger.vercel.app/donor/training";

    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "GiveLedger AI Training Academy", text: msg, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(msg).catch(() => {});
    }

    setSharing(true);
    try {
      const res = await fetch("/api/donor/share-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "training" }),
      });
      if (res.ok) {
        const data = await res.json();
        const newCount = data.trainingShareCount as number;
        // Check if a milestone was just crossed
        const crossed = MILESTONES.find((m) => m.at === newCount);
        if (crossed) setJustUnlocked(crossed.title);
        setShareCount(newCount);
        setShared(true);
        setTimeout(() => { setShared(false); setJustUnlocked(null); }, 3000);
      }
    } catch {}
    setSharing(false);
  }

  const progressPct = Math.min(100, (shareCount / MAX) * 100);

  return (
    <div className="bg-gray-900 rounded-2xl p-5 space-y-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-base font-bold text-white mb-0.5">Share &amp; Earn Impact Score</p>
          <p className="text-[12px] text-gray-400 leading-relaxed max-w-sm">
            Every time you share this free training with a colleague or friend, your Impact Score grows.
            NGOs see your score when reviewing role applications — higher score, stronger first impression.
          </p>
        </div>
        <button
          onClick={handleShare}
          disabled={sharing}
          className="shrink-0 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          {shared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          {shared ? (justUnlocked ? `🎉 ${justUnlocked} unlocked!` : "Shared!") : "Share this training"}
        </button>
      </div>

      {/* Progress bar with milestone markers */}
      <div>
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {/* Milestone tick marks */}
        <div className="relative h-4">
          {MILESTONES.map((m) => {
            const pct = (m.at / MAX) * 100;
            const reached = shareCount >= m.at;
            return (
              <span
                key={m.at}
                className={`absolute top-0 -translate-x-1/2 text-[9px] font-bold transition-colors ${reached ? "text-emerald-400" : "text-gray-600"}`}
                style={{ left: `${pct}%` }}
              >
                {m.at}
              </span>
            );
          })}
          <span className="absolute right-0 text-[9px] font-bold text-gray-600">{MAX}</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">{shareCount} of {MAX} shares</p>
      </div>

      {/* Milestone cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        {MILESTONES.map((m) => {
          const reached = shareCount >= m.at;
          const c = m.unlocked;
          return (
            <div
              key={m.title}
              className={`rounded-xl border p-3 transition-all ${
                reached
                  ? `${c.bg} ${c.border}`
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${reached ? c.bg : "bg-gray-700"}`}>
                  {reached
                    ? <m.Icon className={`w-3.5 h-3.5 ${c.icon}`} />
                    : <Lock className="w-3 h-3 text-gray-500" />
                  }
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${reached ? `${c.badge}` : "bg-gray-700 text-gray-500"}`}>
                  {m.at} shares
                </span>
              </div>
              <p className={`text-xs font-bold mb-0.5 ${reached ? c.title : "text-gray-500"}`}>{m.title}</p>
              <p className={`text-[10px] font-semibold mb-1 ${reached ? c.icon : "text-gray-600"}`}>{m.benefit}</p>
              <p className={`text-[10px] leading-relaxed ${reached ? "text-gray-600" : "text-gray-600"}`}>{m.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
