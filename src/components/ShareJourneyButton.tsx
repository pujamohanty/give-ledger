"use client";
import { useState } from "react";
import { Share2 } from "lucide-react";
import PlatformShareModal from "./PlatformShareModal";

interface Props {
  shareText: string;
  sharePath: string;
  buttonLabel: string;
  variant?: "violet" | "emerald";
  className?: string;
}

export default function ShareJourneyButton({ shareText, sharePath, buttonLabel, variant = "violet", className }: Props) {
  const [open, setOpen] = useState(false);
  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://give-ledger.vercel.app";
  const fullUrl = `${appUrl}${sharePath}`;

  const btnClass = variant === "emerald"
    ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
    : "text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${btnClass} ${className ?? ""}`}
      >
        <Share2 className="w-3.5 h-3.5" />
        {buttonLabel}
      </button>

      <PlatformShareModal
        open={open}
        onClose={() => setOpen(false)}
        url={fullUrl}
        title="My GiveLedger contribution"
        text={shareText}
      />
    </>
  );
}
