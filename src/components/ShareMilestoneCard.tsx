"use client";
import { useState } from "react";
import { Share2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlatformShareModal from "./PlatformShareModal";

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

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : "https://give-ledger.vercel.app"}/share/${milestoneId}`;

  const shareText = `${ngoName} just completed a milestone on their ${projectTitle} project.\n\n"${milestoneName}"\n${metric}\n\nEvery dollar was tracked. Every milestone verified on-chain before funds were released.\n\n#GiveLedger #VerifiedImpact`;

  const emailBody = `I witnessed this impact.\n\n"${milestoneName}" — completed by ${ngoName} on the ${projectTitle} project.\n\n${metric}\n\nEvery dollar donated was milestone-locked and verified on-chain before being released.\n\nSee the full proof trail: ${shareUrl}\n\n#GiveLedger #TransparentGiving #VerifiedImpact`;

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

      <PlatformShareModal
        open={open}
        onClose={() => setOpen(false)}
        url={shareUrl}
        title={`${milestoneName} — verified impact`}
        text={shareText}
        emailBody={emailBody}
      />
    </>
  );
}
