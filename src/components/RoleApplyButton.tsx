"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, X, Loader2 } from "lucide-react";

interface Props {
  roleId: string;
  roleTitle: string;
  defaultLinkedin?: string;
  defaultPortfolio?: string;
}

export default function RoleApplyButton({ roleId, roleTitle, defaultLinkedin, defaultPortfolio }: Props) {
  const [open, setOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState(defaultLinkedin ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(defaultPortfolio ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

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
                <h3 className="font-semibold text-gray-900 text-sm">Apply for role</h3>
                <p className="text-xs text-gray-500 mt-0.5">{roleTitle}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
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

              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1 gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? "Submitting…" : "Submit application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
