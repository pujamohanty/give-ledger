"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Send, X, Loader2, Share2, Check, Linkedin, ExternalLink, Copy, Star, ChevronDown } from "lucide-react";

function isValidLinkedIn(val: string) {
  return /linkedin\.com\/in\/[a-zA-Z0-9\-_%]+/i.test(val.trim());
}
function linkedInHandle(val: string): string {
  const m = val.trim().match(/linkedin\.com\/in\/([a-zA-Z0-9\-_%]+)/i);
  return m ? m[1].toLowerCase().replace(/\/$/, "") : "";
}
function normaliseLinkedIn(val: string) {
  const m = val.trim().match(/linkedin\.com\/in\/[a-zA-Z0-9\-_%]+/i);
  return m ? `https://${m[0]}` : val.trim();
}

interface ApplicationProfile {
  id: string;
  title: string;
  bio: string;
  isDefault: boolean;
}

interface Props {
  roleId: string;
  roleTitle: string;
  defaultLinkedin?: string;
  ngoName?: string;
  impactScore: number;
  profileUrl?: string;
  applicationProfiles?: ApplicationProfile[];
}

export default function RoleApplyButton({ roleId, roleTitle, defaultLinkedin, ngoName, impactScore, profileUrl = "", applicationProfiles = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "share">("form");
  const [coverNote, setCoverNote] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState(defaultLinkedin ?? "");
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    applicationProfiles.find((p) => p.isDefault)?.id ?? applicationProfiles[0]?.id ?? ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [referProfiles, setReferProfiles] = useState(["", ""]);
  const [copied, setCopied] = useState(false);

  const roleUrl = typeof window !== "undefined"
    ? `${window.location.origin}/opportunities/${roleId}`
    : `/opportunities/${roleId}`;

  const shareMessage = ngoName
    ? `${ngoName} is hiring for "${roleTitle}" on GiveLedger — skill contributions are blockchain-verified and count as certified professional experience. Worth a look: ${roleUrl}`
    : `There's an open role for "${roleTitle}" on GiveLedger — worth applying if you have the skills: ${roleUrl}`;

  const ownHandle = linkedInHandle(linkedinUrl);

  function profileError(index: number): string | null {
    const val = referProfiles[index];
    if (!val) return null;
    if (!isValidLinkedIn(val)) return "Not a valid LinkedIn profile URL";
    const handle = linkedInHandle(val);
    if (ownHandle && handle === ownHandle) return "This is your own profile — enter someone else's";
    const otherHandle = linkedInHandle(referProfiles[index === 0 ? 1 : 0]);
    if (otherHandle && handle === otherHandle) return "Same profile as the other contact";
    return null;
  }

  const profileValid = referProfiles.map((p, i) => isValidLinkedIn(p) && profileError(i) === null);
  const canSubmit = profileValid.every(Boolean);

  function updateProfile(index: number, value: string) {
    setReferProfiles((prev) => prev.map((p, i) => (i === index ? value : p)));
  }

  function handleFormNext(e: React.FormEvent) {
    e.preventDefault();
    setStep("share");
  }

  function openContactProfile(profile: string) {
    window.open(normaliseLinkedIn(profile), "_blank");
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      const selectedProfile = applicationProfiles.find((p) => p.id === selectedProfileId);
      const res = await fetch(`/api/roles/${roleId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverNote,
          linkedinUrl,
          portfolioUrl: profileUrl,
          applicationProfileBio: selectedProfile?.bio ?? "",
          applicationProfileTitle: selectedProfile?.title ?? "",
        }),
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
    setReferProfiles(["", ""]);
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
        <p className="text-xs text-gray-500 mb-4">The NGO will review your application and get back to you.</p>
        <Link
          href="/opportunities"
          className="flex items-center justify-center gap-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
        >
          Explore more roles
        </Link>
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

                {/* Impact score badge */}
                {impactScore > 0 ? (
                  <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                    <Star className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <p className="text-[11px] text-violet-700 flex-1">
                      <span className="font-semibold">Impact Score: {impactScore}/30</span>
                      {" — "}NGOs reviewing your application can see this. Increase it by sharing the AI Training Academy, the Beta Program, or starting skill campaigns.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <Star className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <p className="text-[11px] text-gray-500 flex-1">
                      <span className="font-semibold">Impact Score: 0/30</span>
                      {" — "}Boost it by sharing the AI Training Academy, the Beta Program, or starting a skill campaign. NGOs can see your score.
                    </p>
                  </div>
                )}

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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    GiveLedger profile <span className="text-red-500">*</span>
                  </label>
                  <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 truncate">
                    {profileUrl || "Log in to auto-fill your profile link"}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Your public GiveLedger profile is shared with the NGO.{" "}
                    <a href="/donor/profile" target="_blank" className="underline text-emerald-600">Edit your profile</a>
                  </p>
                </div>

                {/* Application profile selector */}
                {applicationProfiles.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Present yourself as
                    </label>
                    <div className="relative">
                      <select
                        value={selectedProfileId}
                        onChange={(e) => setSelectedProfileId(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none pr-8"
                      >
                        {applicationProfiles.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}{p.isDefault ? " (default)" : ""}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {selectedProfileId && (
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                        {applicationProfiles.find((p) => p.id === selectedProfileId)?.bio}
                      </p>
                    )}
                  </div>
                )}

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

            {/* Step 2 — Refer 2 LinkedIn contacts before submitting */}
            {step === "share" && (
              <div className="px-6 py-5 space-y-4">
                {/* Explanation */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <p className="text-xs font-semibold text-amber-800">Refer this role to 2 contacts to complete your application</p>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Paste the LinkedIn profile URLs of 2 people you&apos;ll share this role with. NGOs view candidates who refer others more favourably — it shows confidence and generosity. Use the button next to each profile to open their page and send them the role.
                  </p>
                </div>

                {/* LinkedIn profile fields */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-gray-400" />
                    LinkedIn profiles of your referrals <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  {referProfiles.map((profile, i) => {
                    const touched = profile.length > 0;
                    const err = touched ? profileError(i) : null;
                    const valid = touched && !err;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="url"
                              placeholder={`linkedin.com/in/contact-${i + 1}`}
                              value={profile}
                              onChange={(e) => updateProfile(i, e.target.value)}
                              className={`w-full rounded-lg border px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 transition-colors ${
                                touched && err
                                  ? "border-red-300 focus:ring-red-100"
                                  : valid
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
                            onClick={() => openContactProfile(profile)}
                            title="Open profile to send them the role"
                            className="shrink-0 flex items-center gap-1 bg-[#0A66C2] hover:bg-[#0958a8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {err && (
                          <p className="text-[11px] text-red-500 pl-1">{err}</p>
                        )}
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-gray-400">
                    {canSubmit
                      ? "✓ Both contacts added — open each profile to send them the role link, then submit."
                      : "Enter 2 different LinkedIn profiles (not your own) to continue."}
                  </p>
                </div>

                {/* Copy role link helper */}
                <div className="flex items-center gap-2">
                  <p className="text-[11px] text-gray-400 flex-1">Copy the role link to share in your message:</p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy link"}
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
