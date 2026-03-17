"use client";
import { useState } from "react";
import { Zap, X, Copy, Check, Mail, Linkedin, MessageCircle, Calendar, ChevronDown } from "lucide-react";

interface Props {
  projectId: string;
  projectTitle: string;
  defaultAmount?: number;
}

export default function CreateChallengeButton({ projectId, projectTitle, defaultAmount }: Props) {
  const [open, setOpen]         = useState(false);
  const [step, setStep]         = useState<"form" | "share">("form");
  const [amount, setAmount]     = useState(defaultAmount?.toString() ?? "");
  const [message, setMessage]   = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [copied, setCopied]     = useState(false);

  const challengeUrl = challengeId
    ? `${typeof window !== "undefined" ? window.location.origin : "https://give-ledger.vercel.app"}/challenge/${challengeId}`
    : "";

  const shareText = `I donated $${amount} to "${projectTitle}" on GiveLedger and I'm challenging you to match it. Every dollar goes to verified impact.`;
  const shareTextEncoded = encodeURIComponent(`${shareText}\n\n${challengeUrl}`);

  async function handleCreate() {
    setError("");
    if (!amount || parseFloat(amount) <= 0) { setError("Please enter a valid amount."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, amount: parseFloat(amount), message: message || null, deadline: deadline || null }),
      });
      if (!res.ok) { setError("Failed to create challenge. Please try again."); return; }
      const data = await res.json();
      setChallengeId(data.id);
      setStep("share");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(challengeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    setOpen(false);
    setStep("form");
    setError("");
    setChallengeId("");
    setCopied(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Zap className="w-3.5 h-3.5" />
        Challenge my network
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            {step === "form" ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-violet-600" />
                  </div>
                  <h2 className="font-bold text-gray-900">Challenge your network</h2>
                </div>
                <p className="text-xs text-gray-500 mb-5">
                  Create a shareable page challenging your contacts to match your donation to <span className="font-medium text-gray-700">{projectTitle}</span>.
                </p>

                {/* Amount */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Challenge amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="100"
                      className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100"
                    />
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-2">
                    {[50, 100, 250, 500].map(v => (
                      <button
                        key={v}
                        onClick={() => setAmount(v.toString())}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          amount === v.toString()
                            ? "bg-violet-600 text-white border-violet-600"
                            : "border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600"
                        }`}
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Personal message <span className="font-normal text-gray-400">(optional)</span></label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell your network why this cause matters to you..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 resize-none"
                  />
                </div>

                {/* Deadline */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Deadline <span className="font-normal text-gray-400">(optional)</span></span>
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-violet-400"
                  />
                </div>

                {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {loading ? "Creating…" : "Create challenge"}
                </button>
              </>
            ) : (
              <>
                {/* Share step */}
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg mb-1">Challenge created!</h2>
                  <p className="text-sm text-gray-500">Share it with your network — anyone who clicks can see the challenge and donate.</p>
                </div>

                {/* URL box */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                  <span className="text-xs text-gray-600 truncate flex-1 font-mono">{challengeUrl}</span>
                  <button onClick={handleCopy} className="shrink-0 text-gray-400 hover:text-gray-700">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Share buttons */}
                <div className="space-y-2 mb-5">
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-4 py-3 rounded-xl transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Link copied!" : "Copy challenge link"}
                  </button>

                  <a
                    href={`https://wa.me/?text=${shareTextEncoded}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 bg-[#25D366] hover:opacity-90 text-white font-medium text-sm px-4 py-3 rounded-xl transition-opacity"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Share on WhatsApp
                  </a>

                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(challengeUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 bg-[#0A66C2] hover:opacity-90 text-white font-medium text-sm px-4 py-3 rounded-xl transition-opacity"
                  >
                    <Linkedin className="w-4 h-4" />
                    Share on LinkedIn
                  </a>

                  <a
                    href={`mailto:?subject=${encodeURIComponent(`I'm challenging you to donate to ${projectTitle}`)}&body=${shareTextEncoded}`}
                    className="w-full flex items-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-medium text-sm px-4 py-3 rounded-xl transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Send via Email
                  </a>
                </div>

                <button onClick={handleClose} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
