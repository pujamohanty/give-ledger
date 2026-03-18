"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, X, AlertCircle, CheckCircle } from "lucide-react";

const roleTypes = [
  { value: "INTERNSHIP",        label: "Internship",        desc: "Skill showcase for early-career professionals" },
  { value: "CAREER_TRANSITION", label: "Career Transition",  desc: "Acquire skills to pivot into a new field" },
  { value: "INTERIM",           label: "Interim Role",        desc: "Meaningful role between jobs — no CV gap" },
  { value: "VOLUNTEER",         label: "Volunteer",            desc: "Contribute skills and time to a cause" },
];

const commonSkills = [
  "Marketing", "Design", "IT", "Legal", "Fundraising", "Writing",
  "Finance", "Social Media", "Research", "Training", "Photography",
  "Video", "Data Analysis", "Web Development", "Project Management",
];

export default function NewRolePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [form, setForm] = useState({
    title: "", department: "", roleType: "VOLUNTEER", projectId: "",
    description: "", responsibilities: "", timeCommitment: "",
    durationWeeks: "4", isRemote: true, location: "",
    openings: "1", applicationDeadline: "", startDate: "",
    salaryMin: "", salaryMax: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/ngo/projects-list")
      .then((r) => r.json())
      .then((d) => setProjects(d ?? []))
      .catch(() => {});
  }, []);

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addSkill = (skill: string) => {
    const clean = skill.trim();
    if (clean && !skills.includes(clean)) setSkills((prev) => [...prev, clean]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => setSkills((prev) => prev.filter((s) => s !== skill));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (skills.length === 0) { setError("Add at least one skill required for this role."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ngo/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, skillsRequired: skills.join(",") }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed."); setSubmitting(false); return; }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Role posted!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your opportunity is now live on the public Opportunities board.
            Contributors can apply immediately.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/ngo/roles"><Button>View all roles</Button></Link>
            <Link href="/opportunities"><Button variant="outline">See public listing</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/ngo/roles">
          <Button variant="ghost" size="sm" className="mb-4 flex items-center gap-2 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> Back to roles
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Post a new role</h1>
        <p className="text-sm text-gray-500 mt-1">
          Attract skilled contributors who can help your projects. All engagements
          are verified and recorded on the contributor&apos;s GiveLedger credential.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Role type selection */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Role type *</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-2">
              {roleTypes.map((rt) => (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => set("roleType", rt.value)}
                  className={`text-left p-3 rounded-xl border-2 transition-all ${
                    form.roleType === rt.value
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-900">{rt.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{rt.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Basic details */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Role details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Role title *</Label>
              <Input
                placeholder="e.g. Marketing Strategy Consultant"
                className="mt-1" required
                value={form.title} onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department / team</Label>
                <Input placeholder="e.g. Communications" className="mt-1"
                  value={form.department} onChange={(e) => set("department", e.target.value)} />
              </div>
              <div>
                <Label>Linked project (optional)</Label>
                <select
                  className="mt-1 flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.projectId} onChange={(e) => set("projectId", e.target.value)}
                >
                  <option value="">No specific project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Role description *</Label>
              <textarea
                rows={4} required
                placeholder="Describe this role, its purpose, and how it fits into your organisation's work..."
                className="mt-1 flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                value={form.description} onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div>
              <Label>Key responsibilities *</Label>
              <textarea
                rows={4} required
                placeholder="List the specific tasks and deliverables the contributor will work on..."
                className="mt-1 flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                value={form.responsibilities} onChange={(e) => set("responsibilities", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Skills required *</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {/* Selected skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Custom input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => addSkill(skillInput)}>
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-[11px] text-gray-400 mb-1.5">Quick add:</p>
              <div className="flex flex-wrap gap-1.5">
                {commonSkills.filter((s) => !skills.includes(s)).map((skill) => (
                  <button
                    key={skill} type="button"
                    onClick={() => addSkill(skill)}
                    className="text-[11px] bg-gray-100 text-gray-600 hover:bg-gray-200 px-2.5 py-1 rounded-full transition-colors"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time & logistics */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Time commitment & logistics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Time commitment *</Label>
                <Input placeholder="e.g. 10 hours/week" className="mt-1" required
                  value={form.timeCommitment} onChange={(e) => set("timeCommitment", e.target.value)} />
              </div>
              <div>
                <Label>Duration (weeks) *</Label>
                <Input type="number" min="1" max="52" placeholder="4" className="mt-1" required
                  value={form.durationWeeks} onChange={(e) => set("durationWeeks", e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Location type *</Label>
              <div className="flex gap-3 mt-2">
                {[
                  { value: true,  label: "Remote" },
                  { value: false, label: "On-site / Hybrid" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)} type="button"
                    onClick={() => set("isRemote", opt.value)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      form.isRemote === opt.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {!form.isRemote && (
              <div>
                <Label>Location</Label>
                <Input placeholder="e.g. New York, NY" className="mt-1"
                  value={form.location} onChange={(e) => set("location", e.target.value)} />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Openings</Label>
                <Input type="number" min="1" max="20" className="mt-1"
                  value={form.openings} onChange={(e) => set("openings", e.target.value)} />
              </div>
              <div>
                <Label>Application deadline</Label>
                <Input type="date" className="mt-1"
                  value={form.applicationDeadline} onChange={(e) => set("applicationDeadline", e.target.value)} />
              </div>
              <div>
                <Label>Start date</Label>
                <Input type="date" className="mt-1"
                  value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>
            </div>

            {/* Salary (optional — leave blank for unpaid/volunteer roles) */}
            <div>
              <Label>Salary / stipend (USD/year) — optional</Label>
              <p className="text-[11px] text-gray-400 mb-2">Leave blank for unpaid or volunteer roles.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input type="number" min="0" placeholder="Min e.g. 40000" className="mt-1"
                    value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} />
                  <p className="text-[10px] text-gray-400 mt-1">Minimum USD/year</p>
                </div>
                <div>
                  <Input type="number" min="0" placeholder="Max e.g. 65000" className="mt-1"
                    value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} />
                  <p className="text-[10px] text-gray-400 mt-1">Maximum USD/year</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? "Posting…" : "Post role"}
          </Button>
          <Link href="/ngo/roles">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
