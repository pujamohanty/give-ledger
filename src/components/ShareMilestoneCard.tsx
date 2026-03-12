"use client";
import { useState } from "react";
import { Share2, Linkedin, MessageCircle, Instagram, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ShareMilestoneCardProps {
  milestoneName: string;
  projectTitle: string;
  ngoName: string;
  metric: string; // e.g. "32 children now have clean water"
  evidenceUrl?: string;
  txHash?: string;
  milestoneId: string;
}

export default function ShareMilestoneCard({
  milestoneName,
  projectTitle,
  ngoName,
  metric,
  txHash,
  milestoneId,
}: ShareMilestoneCardProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${milestoneId}`;

  const linkedinCaption = `I witnessed this.\n\n"${milestoneName}" — a milestone just completed by ${ngoName} on the ${projectTitle} project.\n\n${metric}\n\nEvery dollar donated was tracked, every milestone verified on-chain before funds were released.\n\nSee the proof: ${shareUrl}\n\n#GiveLedger #TransparentGiving #VerifiedImpact`;

  const whatsappCaption = `${ngoName} just completed a milestone on their ${projectTitle} project!\n\n"${milestoneName}"\n${metric}\n\nSee the verified proof here: ${shareUrl}`;

  const instagramCaption = `${metric} — milestone verified ✅\n\n${ngoName} · ${projectTitle}\n\nLink in bio to see the full proof trail.\n#GiveLedger #VerifiedImpact #TransparentGiving`;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  const openWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappCaption)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
        onClick={() => setOpen(true)}
      >
        <Share2 className="w-4 h-4" />
        Share Impact
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Share This Impact</h2>
                <p className="text-sm text-gray-500 mt-0.5">Let your network know what their donations achieved</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Impact preview card */}
            <div className="p-5">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Milestone Verified</p>
                    <p className="font-semibold text-gray-900">{milestoneName}</p>
                    <p className="text-sm text-gray-600 mt-1">{ngoName} · {projectTitle}</p>
                    <p className="text-sm font-medium text-emerald-700 mt-2">{metric}</p>
                    {txHash && (
                      <p className="text-xs text-gray-400 mt-2 font-mono">
                        On-chain: {txHash.slice(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Share buttons */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Share to</p>

                <button
                  onClick={openLinkedIn}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">LinkedIn</p>
                    <p className="text-xs text-gray-500">Professional impact post — great for your network</p>
                  </div>
                </button>

                <button
                  onClick={openWhatsApp}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">WhatsApp</p>
                    <p className="text-xs text-gray-500">Send to friends & family directly</p>
                  </div>
                </button>

                <button
                  onClick={() => copyToClipboard(instagramCaption)}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-pink-50 hover:border-pink-200 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Instagram</p>
                    <p className="text-xs text-gray-500">Copy caption → paste in your post</p>
                  </div>
                </button>

                {/* Copy link */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 flex-1 truncate font-mono">{shareUrl}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 flex-shrink-0"
                    onClick={() => copyToClipboard(shareUrl)}
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Donation amounts are never shown. Only the verified outcome is shared.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
