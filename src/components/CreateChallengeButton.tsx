"use client";
import { useState } from "react";
import { Zap, X, Copy, Check, Mail, Linkedin, MessageCircle, Calendar, Briefcase } from "lucide-react";

type ChallengeType = "financial" | "skill";

interface FinancialProps {
  type: "financial";
  projectId: string;
  projectTitle: string;
  defaultAmount?: number;
}
interface SkillProps {
  type: "skill";
  ngoId: string;
  ngoName: string;
  skillCategory: string;
  hoursContributed?: number;
  roleId?: string;
  roleTitle?: string;
}
type Props = FinancialProps | SkillProps;

export default function CreateChallengeButton(props: Props) {
  const [open, setOpen]         = useState(false);
  const [step, setStep]         = useState<"form" | "share">("form");
  const [amount, setAmount]     = useState(props.type === "financial" ? (props.defaultAmount?.toString() ?? "") : "");
  const [message, setMessage]   = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [copied, setCopied]     = useState(false);

  const isSkill = props.type === "skill";

  const challengeUrl = challengeId
    ? `${typeof window !== "undefined" ? window.location.origin : "https://give-ledger.vercel.app"}/challenge/${challengeId}`
    : "";

  const shareText = isSkill
    ? `I contributed ${(props as SkillProps).hoursContributed ? `${(props as SkillProps).hoursContributed} hours of ` : ""}${(props as SkillProps).skillCategory} skills to "${(props as SkillProps).ngoName}" on GiveLedger. I'm challenging you to contribute your skills too — they need help.`
    : `I donated $${amount} to "${(props as FinancialProps).projectTitle}" on GiveLedger and I'm challenging you to match it. Every dollar goes to verified impact.`;
  const shareTextEncoded = encodeURIComponent(`${shareText}\n\n${challengeUrl}`);

  async function handleCreate() {
    setError("");
    setLoading(true);
    try {
      const body = isSkill
        ? {
            challengeType: "SKILL",
            ngoId: (props as SkillProps).ngoId,
            skillCategory: (props as SkillProps).skillCategory,
            hoursContributed: (props as SkillProps).hoursContributed ?? null,
            roleId: (props as SkillProps).roleId ?? null,
            message: message || null,
            deadline: deadline || null,
          }
        : {
            challengeType: "FINANCIAL",
            projectId: (props as FinancialProps).projectId,
            amount: parseFloat(amount),
            message: message || null,
            deadline: deadline || null,
          };

      if (!isSkill && (!amount || parseFloat(amount) <= 0)) {
        setError("Please enter a valid amount.");
        return;
      }

      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  const btnStyle = isSkill
    ? "text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200"
    : "text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200";

  const accentBg = isSkill ? "bg-violet-600 hover:bg-violet-700" : "bg-violet-600 hover:bg-violet-700";
  const Icon = isSkill ? Briefcase : Zap;
  const label = isSkill ? "Challenge my network" : "Challenge my network";
  const title = isSkill
    ? `Challenge your network to contribute ${(props as SkillProps).skillCategory} skills`
    : "Challenge your network to donate";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${btnStyle}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
            <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
              <X className="w-4 h-4" />
            </button>

            {step === "form" ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSkill ? "bg-violet-100" : "bg-violet-100"}`}>
                    <Icon className={`w-4 h-4 ${isSkill ? "text-violet-600" : "text-violet-600"}`} />
                  </div>
                  <h2 className="font-bold text-gray-900">Challenge your network</h2>
                </div>

                {/* Context summary */}
                <div className={`rounded-xl p-3 mb-5 mt-3 ${isSkill ? "bg-violet-50 border border-violet-100" : "bg-gray-50"}`}>
                  {isSkill ? (
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          {(props as SkillProps).skillCategory} contribution to {(props as SkillProps).ngoName}
                        </p>
                        {(props as SkillProps).hoursContributed && (
                          <p className="text-xs text-gray-500">{(props as SkillProps).hoursContributed} hours contributed</p>
                        )}
                        {(props as SkillProps).roleTitle && (
                          <p className="text-xs text-violet-600 mt-0.5">Role: {(props as SkillProps).roleTitle}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">
                      For: <span className="font-medium">{(props as FinancialProps).projectTitle}</span>
                    </p>
                  )}
                </div>

                {/* Amount (financial only) */}
                {!isSkill && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Challenge amount ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                      <input
                        type="number" min="1" value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="100"
                        className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none focus:border-violet-400"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[50, 100, 250, 500].map(v => (
                        <button key={v} onClick={() => setAmount(v.toString())}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${amount === v.toString() ? "bg-violet-600 text-white border-violet-600" : "border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600"}`}>
                          ${v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Personal message <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={message} onChange={e => setMessage(e.target.value)}
                    placeholder={isSkill ? "Tell your network why contributing skills matters…" : "Tell your network why this cause matters to you…"}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-violet-400 resize-none"
                  />
                </div>

                {/* Deadline */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Deadline <span className="font-normal text-gray-400">(optional)</span></span>
                  </label>
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-violet-400"
                  />
                </div>

                {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

                <button onClick={handleCreate} disabled={loading}
                  className={`w-full ${accentBg} text-white font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2`}>
                  <Icon className="w-4 h-4" />
                  {loading ? "Creating…" : "Create challenge"}
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${isSkill ? "bg-violet-100" : "bg-emerald-100"}`}>
                    <Icon className={`w-7 h-7 ${isSkill ? "text-violet-600" : "text-emerald-600"}`} />
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg mb-1">Challenge created!</h2>
                  <p className="text-sm text-gray-500">Share it — anyone who clicks can accept and {isSkill ? "contribute their skills" : "donate"}.</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                  <span className="text-xs text-gray-600 truncate flex-1 font-mono">{challengeUrl}</span>
                  <button onClick={handleCopy} className="shrink-0 text-gray-400 hover:text-gray-700">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="space-y-2 mb-5">
                  <button onClick={handleCopy}
                    className="w-full flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm px-4 py-3 rounded-xl transition-colors">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Link copied!" : "Copy challenge link"}
                  </button>
                  <a href={`https://wa.me/?text=${shareTextEncoded}`} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 bg-[#25D366] hover:opacity-90 text-white font-medium text-sm px-4 py-3 rounded-xl transition-opacity">
                    <MessageCircle className="w-4 h-4" /> Share on WhatsApp
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(challengeUrl)}`} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 bg-[#0A66C2] hover:opacity-90 text-white font-medium text-sm px-4 py-3 rounded-xl transition-opacity">
                    <Linkedin className="w-4 h-4" /> Share on LinkedIn
                  </a>
                  <a href={`mailto:?subject=${encodeURIComponent(`I'm challenging you — ${isSkill ? "contribute your skills to " + ((props as SkillProps).ngoName ?? "") : "donate to " + ((props as FinancialProps).projectTitle ?? "")}`)}&body=${shareTextEncoded}`}
                    className="w-full flex items-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-medium text-sm px-4 py-3 rounded-xl transition-colors">
                    <Mail className="w-4 h-4" /> Send via Email
                  </a>
                </div>

                <button onClick={handleClose} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">Done</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
