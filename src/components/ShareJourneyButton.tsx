"use client";
import { useState } from "react";
import { Share2, X, Copy, Check, Linkedin, MessageCircle, Mail } from "lucide-react";

interface Props {
  shareText: string;
  sharePath: string;
  buttonLabel: string;
  variant?: "violet" | "emerald";
  className?: string;
}

export default function ShareJourneyButton({ shareText, sharePath, buttonLabel, variant = "violet", className }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://give-ledger.vercel.app";
  const fullUrl = `${appUrl}${sharePath}`;
  const fullText = `${shareText}\n\n${fullUrl}`;
  const encoded = encodeURIComponent(fullText);

  function handleCopy() {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="font-bold text-gray-900 mb-1">Share with your network</h2>
            <p className="text-xs text-gray-500 mb-4">Let your connections see what you&apos;re doing.</p>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4 text-xs text-gray-600 leading-relaxed">
              {shareText}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-4 py-3 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy to clipboard"}
              </button>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 bg-[#0A66C2] hover:opacity-90 text-white font-medium text-sm px-4 py-3 rounded-xl transition-opacity"
              >
                <Linkedin className="w-4 h-4" /> Share on LinkedIn
              </a>
              <a
                href={`https://wa.me/?text=${encoded}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 bg-[#25D366] hover:opacity-90 text-white font-medium text-sm px-4 py-3 rounded-xl transition-opacity"
              >
                <MessageCircle className="w-4 h-4" /> Share on WhatsApp
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent("I'm contributing my skills to a great cause")}&body=${encoded}`}
                className="w-full flex items-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-medium text-sm px-4 py-3 rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4" /> Send via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
