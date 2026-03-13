"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Upload, AlertCircle } from "lucide-react";

type Milestone = {
  id: string;
  name: string;
  requiredAmount: number;
  targetDate: string | null;
};

type Project = {
  id: string;
  title: string;
  status: string;
  milestones: Milestone[];
};

const FILE_TYPES = ["PDF", "PHOTOS", "ZIP", "VIDEO", "SPREADSHEET", "OTHER"];

export default function SubmitMilestoneForm() {
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [projectId, setProjectId] = useState(searchParams.get("project") ?? "");
  const [milestoneId, setMilestoneId] = useState(searchParams.get("milestone") ?? "");
  const [narrative, setNarrative] = useState("");
  const [outputMarkers, setOutputMarkers] = useState([{ label: "", value: "" }]);
  const [evidenceFiles, setEvidenceFiles] = useState([{ fileName: "", fileType: "PDF" }]);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [releasedAmount, setReleasedAmount] = useState(0);

  useEffect(() => {
    fetch("/api/ngo/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          setFetchError("Could not load projects.");
        }
        setLoading(false);
      })
      .catch(() => {
        setFetchError("Could not connect to database.");
        setLoading(false);
      });
  }, []);

  const selectedProject = projects.find((p) => p.id === projectId);
  const pendingMilestones = selectedProject?.milestones ?? [];
  const selectedMilestone = pendingMilestones.find((m) => m.id === milestoneId);

  useEffect(() => {
    if (selectedMilestone) setReleasedAmount(selectedMilestone.requiredAmount);
  }, [selectedMilestone]);

  const addOutputMarker = () => setOutputMarkers((prev) => [...prev, { label: "", value: "" }]);
  const removeOutputMarker = (i: number) => setOutputMarkers((prev) => prev.filter((_, idx) => idx !== i));
  const updateOutputMarker = (i: number, field: "label" | "value", val: string) =>
    setOutputMarkers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: val } : m)));

  const addFile = () => setEvidenceFiles((prev) => [...prev, { fileName: "", fileType: "PDF" }]);
  const removeFile = (i: number) => setEvidenceFiles((prev) => prev.filter((_, idx) => idx !== i));
  const updateFile = (i: number, field: "fileName" | "fileType", val: string) =>
    setEvidenceFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, [field]: val } : f)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneId || !narrative || evidenceFiles.some((f) => !f.fileName)) {
      setError("Please fill in all required fields and at least one evidence file.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/ngo/submit-milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId,
          narrative,
          outputMarkers: outputMarkers.filter((m) => m.label && m.value),
          evidenceFiles: evidenceFiles.filter((f) => f.fileName),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Evidence Submitted</h1>
          <p className="text-gray-500 mb-2">
            Your completion report for <strong>{selectedMilestone?.name}</strong> is now under admin review.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Once approved, <strong>${releasedAmount.toLocaleString()}</strong> will be released and recorded on the Polygon blockchain. You&apos;ll receive a notification within 72 hours.
          </p>
          <Link href="/ngo/dashboard">
            <Button className="w-full">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <Link href="/ngo/dashboard">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Upload className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Milestone Evidence</h1>
          <p className="text-sm text-gray-500">Provide proof of completion to trigger fund release</p>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 my-6 text-sm text-emerald-800">
        Funds are released only after this evidence is reviewed and approved by the GiveLedger admin team.
        Be thorough — rejections delay your disbursement.
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading your projects...</p>
      ) : fetchError ? (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fetchError}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-4">You have no active projects with pending milestones.</p>
          <Link href="/ngo/projects/new">
            <Button variant="outline">Create a Project</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project + milestone selection */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project <span className="text-red-500">*</span>
                </label>
                <select
                  value={projectId}
                  onChange={(e) => { setProjectId(e.target.value); setMilestoneId(""); }}
                  required
                  className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              {projectId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Milestone to submit <span className="text-red-500">*</span>
                  </label>
                  {pendingMilestones.length === 0 ? (
                    <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
                      No pending milestones on this project. All milestones may already be submitted or completed.
                    </p>
                  ) : (
                    <select
                      value={milestoneId}
                      onChange={(e) => setMilestoneId(e.target.value)}
                      required
                      className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select a milestone</option>
                      {pendingMilestones.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — ${m.requiredAmount.toLocaleString()} release
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {selectedMilestone && (
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">On approval</p>
                  <p className="text-2xl font-bold text-emerald-900">${selectedMilestone.requiredAmount.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-1">will be released and recorded on-chain</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completion narrative */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Completion Report <span className="text-red-500">*</span></CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400 mb-3">
                Describe exactly what was delivered. Include dates, quantities, names of beneficiaries, challenges, and outcomes. The more detail, the faster the review.
              </p>
              <textarea
                required
                rows={6}
                placeholder="e.g. Phase 2 installation was completed across Schools 7–12 between Mar 10–18. All 6 filtration units were installed, tested, and certified by independent water quality lab. School principals at all 6 schools have signed off. 2,400 students are now using the systems daily..."
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </CardContent>
          </Card>

          {/* Output markers */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Output Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400 mb-4">
                Add measurable outcomes — these appear on the public milestone proof page.
              </p>
              <div className="space-y-3">
                {outputMarkers.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Metric name (e.g. Schools fitted)"
                      value={m.label}
                      onChange={(e) => updateOutputMarker(i, "label", e.target.value)}
                      className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 6 of 12)"
                      value={m.value}
                      onChange={(e) => updateOutputMarker(i, "value", e.target.value)}
                      className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {outputMarkers.length > 1 && (
                      <button type="button" onClick={() => removeOutputMarker(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOutputMarker}
                className="mt-3 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="w-4 h-4" /> Add metric
              </button>
            </CardContent>
          </Card>

          {/* Evidence files */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Evidence Files <span className="text-red-500">*</span></CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400 mb-4">
                List all documents and files you are submitting as evidence. Include the exact file names so our team can match them to any files you share separately.
              </p>
              <div className="space-y-3">
                {evidenceFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="File name (e.g. water-quality-report-march.pdf)"
                      value={f.fileName}
                      onChange={(e) => updateFile(i, "fileName", e.target.value)}
                      required
                      className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <select
                      value={f.fileType}
                      onChange={(e) => updateFile(i, "fileType", e.target.value)}
                      className="h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {FILE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {evidenceFiles.length > 1 && (
                      <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addFile}
                className="mt-3 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="w-4 h-4" /> Add file
              </button>
            </CardContent>
          </Card>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-emerald-700 hover:bg-emerald-800"
            disabled={submitting || !milestoneId || !narrative}
          >
            {submitting ? "Submitting..." : "Submit for Admin Review"}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            You will be notified by email once the admin team has reviewed your submission.
          </p>
        </form>
      )}
    </div>
  );
}
