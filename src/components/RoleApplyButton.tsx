"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, X, Loader2, Share2, Check, Phone } from "lucide-react";

function digitsOnly(val: string) { return val.replace(/\D/g, ""); }
function isValidPhone(val: string) { const d = digitsOnly(val); return d.length >= 7 && d.length <= 15; }
function waLink(number: string, text: string) {
  const clean = digitsOnly(number);
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

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
  const [referNumbers, setReferNumbers] = useState(["", ""]);

  const roleUrl = typeof window !== "undefined"
    ? `${window.location.origin}/opportunities/${roleId}`
    : `/opportunities/${roleId}`;

  const shareText = ngoName
    ? `${ngoName} is hiring for "${roleTitle}" on GiveLedger — a platform where skills contributions are blockchain-verified and count as certified professional experience. Worth a look:\n${roleUrl}`
    : `There's an open role for "${roleTitle}" on GiveLedger — worth applying if you have the skills:\n${roleUrl}`;

  const validNumbers = referNumbers.filter((n) => isValidPhone(n));
  const canSubmit = validNumbers.length >= 2;

  function updateNumber(index: number, value: string) {
    setReferNumbers((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function handleFormNext(e: React.FormEvent) {
    e.preventDefault();
    setStep("share");
  }

  function sendToContact(number: string) {
    window.open(waLink(number, shareText), "_blank");
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
    setReferNumbers(["", ""]);
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    LinkedIn profile URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
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

            {/* Step 2 — Refer contacts via WhatsApp before submitting */}
            {step === "share" && (
              <div className="px-6 py-5 space-y-4">
                {/* Explanation */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <p className="text-xs font-semibold text-amber-800">Refer this role to 2 people to complete your application</p>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Enter the WhatsApp numbers of 2 people you&apos;ll share this role with. NGOs view candidates who refer others more favourably — it shows confidence and generosity. Hit the send button next to each number to message them directly.
                  </p>
                </div>

                {/* WhatsApp number fields */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    WhatsApp numbers <span className="text-red-500 ml-0.5">*</span>
                    <span className="text-gray-400 font-normal ml-1">— include country code e.g. +44 7700 900000</span>
                  </label>
                  {referNumbers.map((number, i) => {
                    const touched = number.length > 0;
                    const valid = isValidPhone(number);
                    return (
                      <div key={i} className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="tel"
                            placeholder={`Contact ${i + 1} WhatsApp number`}
                            value={number}
                            onChange={(e) => updateNumber(i, e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 transition-colors ${
                              touched && !valid
                                ? "border-red-300 focus:ring-red-100"
                                : touched && valid
                                ? "border-emerald-400 focus:ring-emerald-100"
                                : "border-gray-300 focus:ring-emerald-100"
                            }`}
                          />
                          {touched && (
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                              {valid
                                ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                                : <X className="w-3.5 h-3.5 text-red-400" />}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={!valid}
                          onClick={() => sendToContact(number)}
                          className="shrink-0 flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-gray-400">
                    {canSubmit
                      ? "✓ Both numbers entered — hit Send on each to message them, then submit."
                      : `Enter ${2 - validNumbers.length} more valid number${2 - validNumbers.length === 1 ? "" : "s"} to continue.`}
                  </p>
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
                    disabled={!canSubmit || submitting}
                    onClick={handleSubmit}
                    className="flex-1 gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? "Submitting…" : "Complete application"}
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
