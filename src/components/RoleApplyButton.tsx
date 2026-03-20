"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, X, Loader2, Share2, Copy, Check } from "lucide-react";

interface Props {
  roleId: string;
  roleTitle: string;
  defaultLinkedin?: string;
  defaultPortfolio?: string;
  ngoName?: string;
}

export default function RoleApplyButton({ roleId, roleTitle, defaultLinkedin, defaultPortfolio, ngoName }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "share">("form");
  const [coverNote, setCoverNote] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState(defaultLinkedin ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(defaultPortfolio ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [shareCount, setShareCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const roleUrl = typeof window !== "undefined"
    ? `${window.location.origin}/opportunities/${roleId}`
    : `/opportunities/${roleId}`;

  const shareText = ngoName
    ? `${ngoName} is hiring for "${roleTitle}" — open role on GiveLedger. Worth applying if you have the skills.`
    : `This NGO is hiring for "${roleTitle}" — open role on GiveLedger. Worth applying if you have the skills.`;

  function handleFormNext(e: React.FormEvent) {
    e.preventDefault();
    setStep("share");
  }

  function trackShare(action: () => void) {
    action();
    setShareCount((c) => c + 1);
  }

  function handleWhatsApp() {
    trackShare(() =>
      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${roleUrl}`)}`, "_blank")
    );
  }

  function handleLinkedIn() {
    trackShare(() =>
      window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(roleUrl)}&title=${encodeURIComponent(roleTitle)}&summary=${encodeURIComponent(shareText)}`, "_blank")
    );
  }

  function handleCopy() {
    trackShare(() =>
      navigator.clipboard.writeText(`${shareText}\n${roleUrl}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
    );
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/roles/${roleId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverNote, linkedinUrl, portfolioUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }
      setDone(true);
      setOpen(false);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setStep("form");
    setShareCount(0);
    setCopied(false);
    setError("");
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Send className="w-5 h-5 text-emerald-600" />
        </div>
        <p className="font-semibold text-gray-900 text-sm mb-1">Application submitted!</p>
        <p className="text-xs text-gray-500">The NGO will review your application and get back to you.</p>
      </div>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full">
        Apply for this role
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {step === "form" ? "Apply for role" : "One last step"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{roleTitle}</p>
              </div>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1 — Application form */}
            {step === "form" && (
              <form onSubmit={handleFormNext} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Why are you a good fit? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describe your relevant experience, what you hope to contribute, and why this role interests you..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    required
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">LinkedIn profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Portfolio or website URL</label>
                  <input
                    type="url"
                    placeholder="https://yourportfolio.com"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 gap-2">
                    Continue <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2 — Share before submitting */}
            {step === "share" && (
              <div className="px-6 py-5 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <p className="text-xs font-semibold text-amber-800">Share this role with at least 2 people to submit</p>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    NGOs notice candidates who share openly — it signals confidence and generosity. Candidates who share are viewed more favourably than those who keep the opportunity to themselves.
                  </p>
                </div>

                {/* Share progress */}
                <div className="flex items-center gap-3">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${i < shareCount ? "bg-emerald-500" : "bg-gray-200"}`}
                    />
                  ))}
                  <span className="text-xs font-semibold text-gray-500 shrink-0">
                    {Math.min(shareCount, 2)}/2 shared
                  </span>
                </div>

                {/* Share buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleWhatsApp}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-semibold rounded-lg px-3 py-2.5 transition-colors"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={handleLinkedIn}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#0A66C2] hover:bg-[#0958a8] text-white text-xs font-semibold rounded-lg px-3 py-2.5 transition-colors"
                  >
                    LinkedIn
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg px-3 py-2.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("form")}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    disabled={shareCount < 2 || submitting}
                    onClick={handleSubmit}
                    className="flex-1 gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? "Submitting…" : shareCount < 2 ? `Share ${2 - shareCount} more` : "Complete application"}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
