"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Mail, Linkedin, MessageCircle, Zap } from "lucide-react";

interface Props {
  challengeId: string;
  projectId: string;
  projectTitle: string;
  donorName: string;
  amount: number;
  isExpired: boolean;
  initialCount: number;
}

export default function ChallengeActions({
  challengeId, projectId, projectTitle, donorName, amount, isExpired, initialCount,
}: Props) {
  const router = useRouter();
  const [count, setCount]     = useState(initialCount);
  const [accepted, setAccepted] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  const challengeUrl = typeof window !== "undefined"
    ? `${window.location.origin}/challenge/${challengeId}`
    : `https://give-ledger.vercel.app/challenge/${challengeId}`;

  const shareText = `${donorName} donated $${amount.toLocaleString()} to "${projectTitle}" on GiveLedger and challenged me to match it. Will you?`;
  const shareTextEncoded = encodeURIComponent(`${shareText}\n\n${challengeUrl}`);

  async function handleAccept() {
    if (accepted || isExpired) return;
    const res = await fetch(`/api/challenges/${challengeId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput.trim() || null }),
    });
    if (res.ok) {
      const data = await res.json();
      setCount(data.count);
      setAccepted(true);
      setShowNamePrompt(false);
      router.push(`/projects/${projectId}`);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(challengeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isExpired) {
    return (
      <div className="text-center py-3 bg-gray-50 rounded-xl text-sm text-gray-400">
        This challenge has expired
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Name prompt before accepting */}
      {showNamePrompt ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400"
            onKeyDown={e => e.key === "Enter" && handleAccept()}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Accept & Donate
            </button>
            <button
              onClick={() => setShowNamePrompt(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNamePrompt(true)}
          disabled={accepted}
          className={`w-full font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
            accepted
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          <Zap className="w-4 h-4" />
          {accepted ? `Challenge accepted · ${count} total` : "Accept Challenge & Donate"}
        </button>
      )}

      {/* Share row */}
      <div className="flex items-center gap-2">
        <p className="text-xs text-gray-400 shrink-0">Share:</p>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy link"}
        </button>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${shareTextEncoded}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#25D366] hover:opacity-90 transition-opacity"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-white" />
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(challengeUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A66C2] hover:opacity-90 transition-opacity"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4 text-white" />
        </a>

        {/* Email */}
        <a
          href={`mailto:?subject=${encodeURIComponent(`${donorName} challenged you to donate`)}&body=${shareTextEncoded}`}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
          title="Share via Email"
        >
          <Mail className="w-4 h-4 text-white" />
        </a>
      </div>
    </div>
  );
}
