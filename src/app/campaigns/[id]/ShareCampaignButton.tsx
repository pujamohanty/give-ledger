"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import PlatformShareModal from "@/components/PlatformShareModal";

interface Props {
  campaignId: string;
  title: string;
  isSkill?: boolean;
  projectTitle?: string;
}

export default function ShareCampaignButton({ campaignId, title, isSkill = false, projectTitle }: Props) {
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/campaigns/${campaignId}`
    : `https://give-ledger.vercel.app/campaigns/${campaignId}`;

  const text = isSkill
    ? `I'm running a skill campaign for "${projectTitle ?? title}" on GiveLedger. They need professionals to contribute their skills — it's recorded as verified work experience on your credential, not just volunteering. See the open roles:`
    : `Support my campaign: "${title}" — every dollar is milestone-locked and verified on-chain. See how donations become real outcomes:`;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => setOpen(true)}
      >
        <Share2 className="w-4 h-4" />
        Share This Campaign
      </Button>

      <PlatformShareModal
        open={open}
        onClose={() => setOpen(false)}
        url={url}
        title={title}
        text={text}
        showInvite={isSkill}
      />
    </>
  );
}
