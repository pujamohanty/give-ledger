"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Clock, Star } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Accept / Reject an application ──────────────────────────────────────────

interface ApplicationActionsProps {
  applicationId: string;
  applicantName: string;
}

export function ApplicationActions({ applicationId, applicantName }: ApplicationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [done, setDone] = useState<"accepted" | "rejected" | null>(null);

  const act = async (action: "accept" | "reject") => {
    setLoading(action);
    try {
      const res = await fetch(`/api/roles/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setDone(action === "accept" ? "accepted" : "rejected");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  if (done === "accepted") return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
      <CheckCircle className="w-3.5 h-3.5" /> Accepted
    </span>
  );
  if (done === "rejected") return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
      <XCircle className="w-3.5 h-3.5" /> Rejected
    </span>
  );

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="text-xs h-7 gap-1 text-red-600 border-red-200 hover:bg-red-50"
        disabled={loading !== null}
        onClick={() => act("reject")}
      >
        {loading === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
        Decline
      </Button>
      <Button
        size="sm"
        className="text-xs h-7 gap-1"
        disabled={loading !== null}
        onClick={() => act("accept")}
      >
        {loading === "accept" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
        Accept {applicantName.split(" ")[0]}
      </Button>
    </div>
  );
}

// ─── Log Hours (donor) ────────────────────────────────────────────────────────

interface LogHoursProps {
  engagementId: string;
  currentHours: number;
}

export function LogHoursButton({ engagementId, currentHours }: LogHoursProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState("2");
  const [workSummary, setWorkSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/roles/engagements/${engagementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logHours", hours, workSummary }),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => setOpen(true)}>
        <Clock className="w-3 h-3" /> Log hours
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Log hours</h3>
            <p className="text-xs text-gray-500 mb-4">Currently logged: {currentHours}h total</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hours to add *</label>
                <input
                  type="number" min="0.5" step="0.5" required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={hours} onChange={(e) => setHours(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">What did you work on?</label>
                <textarea
                  rows={3} placeholder="Brief description of work completed..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  value={workSummary} onChange={(e) => setWorkSummary(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1 text-xs gap-1">
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />} Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Complete Engagement (NGO) ─────────────────────────────────────────────────

interface CompleteEngagementProps {
  engagementId: string;
  contributorName: string;
  roleTitle: string;
  hoursLogged: number;
}

export function CompleteEngagementButton({ engagementId, contributorName, roleTitle, hoursLogged }: CompleteEngagementProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [monetaryValue, setMonetaryValue] = useState("");
  const [skillCategory, setSkillCategory] = useState("OTHER");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const skillCategories = [
    { value: "IT", label: "IT / Technology" },
    { value: "MARKETING", label: "Marketing / Communications" },
    { value: "LEGAL", label: "Legal / Compliance" },
    { value: "FUNDRAISING", label: "Fundraising" },
    { value: "DESIGN", label: "Design / Creative" },
    { value: "TRAINING", label: "Training / Education" },
    { value: "OTHER", label: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/roles/engagements/${engagementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete", ngoFeedback: feedback, monetaryValue, skillCategory }),
      });
      if (res.ok) {
        setDone(true);
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
      <Star className="w-3.5 h-3.5" /> Completed
    </span>
  );

  return (
    <>
      <Button size="sm" className="text-xs h-7 gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => setOpen(true)}>
        <CheckCircle className="w-3 h-3" /> Mark complete
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Confirm completion</h3>
            <p className="text-xs text-gray-500 mb-4">
              You are confirming {contributorName}&apos;s contribution to &quot;{roleTitle}&quot; ({hoursLogged}h logged).
              This will create a verified record on their GiveLedger profile.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Skill category *</label>
                <select
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)}
                >
                  {skillCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estimated monetary value (USD)</label>
                <input
                  type="number" min="0" placeholder="e.g. 2500"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={monetaryValue} onChange={(e) => setMonetaryValue(e.target.value)}
                />
                <p className="text-[11px] text-gray-400 mt-1">What would this work cost at market rate? Used on their credential.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Your feedback (public endorsement) *</label>
                <textarea
                  rows={3} required
                  placeholder={`Write a short endorsement of ${contributorName}'s work...`}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  value={feedback} onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />} Confirm & endorse
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
