"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, Circle, ExternalLink, Shield, Clock, Users, ArrowLeft,
  CreditCard, X, Star, Gift, FileText, Camera, Globe, CalendarDays, Linkedin,
  Crown, Briefcase, DollarSign, ChevronRight, MapPin, Timer,
} from "lucide-react";
import ShareMilestoneCard from "@/components/ShareMilestoneCard";

const categoryLabel: Record<string, string> = {
  INCOME_GENERATION: "Income Generation",
  CHILD_CARE: "Child Care",
  ELDERLY_CARE: "Elderly Care",
  PHYSICALLY_DISABLED: "Accessibility",
  PET_CARE: "Animal Welfare",
  OTHER: "Other",
};

export type NgoRolePreview = {
  id: string;
  title: string;
  roleType: string;
  timeCommitment: string;
  skillsRequired: string;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  durationWeeks: number;
};

export type BoardMemberPreview = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  linkedinUrl: string | null;
  photoUrl: string | null;
};

export type ProjectDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  raisedAmount: number;
  goalAmount: number;
  donorCount: number;
  daysLeft: number;
  ngo: {
    id: string;
    orgName: string;
    description: string | null;
    country: string | null;
    website: string | null;
    foundedYear: string;
    boardMembers: BoardMemberPreview[];
  };
  milestones: Array<{
    id: string;
    name: string;
    status: string;
    targetDate: string | null;
    requiredAmount: number;
    txHash: string | null;
    metric: string | null;
    narrative: string | null;
    evidenceFiles: Array<{ fileName: string; fileType: string; url: string }>;
    outputMarkers: Array<{ label: string; value: string; unit: string | null }>;
  }>;
  financialLeaderboard: Array<{
    id: string;
    name: string;
    jobTitle: string | null;
    company: string | null;
    total: number;
    firstAt: Date;
  }>;
  skillContributors: Array<{
    id: string;
    name: string;
    jobTitle: string | null;
    company: string | null;
    skillCategory: string;
    hoursContributed: number | null;
    monetaryValue: number | null;
  }>;
  ngoRoles: NgoRolePreview[];
};

const suggestedAmounts = [25, 50, 100, 250, 500];

function DonationModal({
  projectTitle,
  projectId,
  onClose,
}: {
  projectTitle: string;
  projectId: string;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState<number>(50);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const finalAmount = custom ? parseFloat(custom) : amount;

  const handleDonate = async () => {
    if (!finalAmount || finalAmount < 1) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, projectTitle, amount: finalAmount }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Make a Donation</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Supporting: <strong>{projectTitle}</strong>
          </p>
          <p className="text-sm font-medium text-gray-700 mb-3">Select amount (USD)</p>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {suggestedAmounts.map((a) => (
              <button
                key={a}
                onClick={() => { setAmount(a); setCustom(""); }}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  amount === a && !custom
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-gray-200 text-gray-700 hover:border-emerald-400"
                }`}
              >
                ${a}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            placeholder="Custom amount"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setAmount(0); }}
            className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
          />
          <div className="bg-emerald-50 rounded-lg p-3 mb-5 flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800">
              Your donation is milestone-locked. Funds release only when verified deliverables are recorded on-chain.
            </p>
          </div>
          <Button
            onClick={handleDonate}
            disabled={loading || !finalAmount || finalAmount < 1}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <CreditCard className="w-4 h-4" />
            {loading ? "Redirecting to Stripe..." : `Donate $${finalAmount || 0} Securely`}
          </Button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Secured by Stripe · SSL encrypted · Instant receipt
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Contribution Choice Modal ───────────────────────────────────────────────
function ContributionChoiceModal({
  onClose,
  onFinancial,
  onSkill,
  hasRoles,
}: {
  onClose: () => void;
  onFinancial: () => void;
  onSkill: () => void;
  hasRoles: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900">How would you like to contribute?</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            GiveLedger recognises money, skills, and time as equal forms of giving — all credited equally.
          </p>
          <div className="space-y-3">
            {/* Financial */}
            <button
              onClick={onFinancial}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">Financial Donation</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Milestone-locked — funds release only when deliverables are verified on-chain.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Skill */}
            <button
              onClick={onSkill}
              disabled={!hasRoles}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group ${
                hasRoles
                  ? "border-violet-200 bg-violet-50 hover:border-violet-400 hover:bg-violet-100"
                  : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${hasRoles ? "bg-violet-600" : "bg-gray-300"}`}>
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">Skill Contribution</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hasRoles
                    ? "Apply for an open role — contribute your professional skills and earn a verified credential."
                    : "No open roles at this time. Check back later or donate financially."}
                </p>
              </div>
              {hasRoles && (
                <ChevronRight className="w-4 h-4 text-violet-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Skill Contribution Modal ─────────────────────────────────────────────────
const roleTypeLabel: Record<string, string> = {
  VOLUNTEER: "Volunteer",
  INTERNSHIP: "Internship",
  CAREER_TRANSITION: "Career Transition",
  INTERIM: "Interim",
};

function SkillContributionModal({
  ngoName,
  roles,
  onClose,
}: {
  ngoName: string;
  roles: NgoRolePreview[];
  onClose: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<NgoRolePreview | null>(null);
  const [hours, setHours] = useState<number>(10);
  const [coverNote, setCoverNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Hourly rate: use midpoint of salary range / 2080 working hours, else $50 default
  const hourlyRate = selectedRole
    ? selectedRole.salaryMin && selectedRole.salaryMax
      ? Math.round(((selectedRole.salaryMin + selectedRole.salaryMax) / 2) / 2080)
      : selectedRole.salaryMin
      ? Math.round(selectedRole.salaryMin / 2080)
      : 50
    : 50;
  const estimatedValue = Math.round(hours * hourlyRate);

  const handleApply = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/roles/${selectedRole.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverNote: coverNote || `I'd like to contribute ${hours} hours of my ${selectedRole.skillsRequired.split(",")[0]} skills to this project.` }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (res.status === 403) {
        const data = await res.json();
        setError(data.error === "UPGRADE_REQUIRED"
          ? "You need a BASIC or PRO plan to apply for roles."
          : "You've reached your application limit. Upgrade to PRO for unlimited applications.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-violet-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-sm text-gray-500 mb-1">
              You applied for <strong>{selectedRole?.title}</strong> at {ngoName}.
            </p>
            <p className="text-xs text-gray-400 mb-1">Estimated contribution value</p>
            <p className="text-2xl font-bold text-violet-700 mb-5">
              ${estimatedValue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mb-6">
              The NGO will review your application. Once accepted, your work will be tracked, credited on your GiveLedger profile, and recorded on-chain.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
              <Button
                onClick={() => { window.location.href = "/donor/opportunities"; }}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              >
                View My Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <Card className="w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <CardContent className="p-6 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h3 className="font-bold text-gray-900">Contribute Your Skills</h3>
              <p className="text-xs text-gray-500">{ngoName} · {roles.length} open role{roles.length !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role list or detail */}
          {!selectedRole ? (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 group-hover:text-violet-800">{role.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                          {roleTypeLabel[role.roleType] ?? role.roleType}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Timer className="w-3 h-3" />{role.timeCommitment}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                          <MapPin className="w-3 h-3" />{role.isRemote ? "Remote" : "On-site"}
                        </span>
                        {role.salaryMin ? (
                          <span className="text-[10px] font-semibold text-emerald-700">
                            ${role.salaryMin.toLocaleString()}{role.salaryMax ? `–$${role.salaryMax.toLocaleString()}` : "+"}/yr
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">Volunteer</span>
                        )}
                      </div>
                      {role.skillsRequired && (
                        <p className="text-[10px] text-gray-400 mt-1 truncate">
                          Skills: {role.skillsRequired}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-500 shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1">
              {/* Back */}
              <button
                onClick={() => { setSelectedRole(null); setError(""); }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> All roles
              </button>

              {/* Selected role summary */}
              <div className="bg-violet-50 rounded-xl p-4 mb-4">
                <p className="font-semibold text-violet-900 text-sm">{selectedRole.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-200 text-violet-700">
                    {roleTypeLabel[selectedRole.roleType] ?? selectedRole.roleType}
                  </span>
                  <span className="text-[10px] text-violet-700">{selectedRole.timeCommitment}</span>
                  <span className="text-[10px] text-violet-700">{selectedRole.isRemote ? "Remote" : "On-site"}</span>
                  <span className="text-[10px] text-violet-600">{selectedRole.durationWeeks} weeks</span>
                </div>
              </div>

              {/* Hours input */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-700 block mb-1.5">
                  How many hours do you plan to contribute?
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={hours}
                    onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 h-10 rounded-lg border border-gray-200 px-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-500">hours</span>
                </div>
              </div>

              {/* Estimated value */}
              <div className="bg-emerald-50 rounded-xl p-4 mb-4 flex items-center gap-3">
                <div>
                  <p className="text-xs text-gray-500">Estimated contribution value</p>
                  <p className="text-xl font-bold text-emerald-700">${estimatedValue.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Based on ${hourlyRate}/hr market rate · Credited on your GiveLedger profile &amp; CV
                  </p>
                </div>
              </div>

              {/* Cover note */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-700 block mb-1.5">
                  Brief message to the NGO <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={`I'd like to contribute my ${selectedRole.skillsRequired.split(",")[0]} skills to help with this project...`}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">
                  {error}{" "}
                  {error.includes("plan") && (
                    <Link href="/pricing" className="underline font-medium">View plans →</Link>
                  )}
                </div>
              )}

              <div className="bg-violet-950 rounded-xl p-3 mb-4">
                <p className="text-xs text-violet-200 leading-relaxed">
                  Once accepted by the NGO, your contribution will be tracked, a verified credential issued to your profile, and the value recorded on-chain.
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {selectedRole && (
            <div className="shrink-0 pt-3 border-t border-gray-100">
              <Button
                onClick={handleApply}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2"
                size="lg"
              >
                <Briefcase className="w-4 h-4" />
                {loading ? "Submitting application..." : `Apply — Contribute ${hours}h ($${estimatedValue.toLocaleString()} value)`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SpotlightVoteButton({ projectId }: { projectId: string }) {
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleVote() {
    if (voted || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/spotlight`, { method: "POST" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (res.ok) setVoted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleVote}
      disabled={voted || loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
        voted
          ? "bg-amber-50 border-amber-200 text-amber-700 cursor-default"
          : "border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700"
      }`}
    >
      <Star className={`w-4 h-4 ${voted ? "fill-amber-500 text-amber-500" : ""}`} />
      {loading ? "Saving…" : voted ? "Spotlight Vote Cast!" : "Vote for Spotlight"}
    </button>
  );
}


export default function ProjectDetailClient({ project }: { project: ProjectDetail }) {
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const [supportersTab, setSupportersTab] = useState<"financial" | "skills">("financial");

  function openContribute() { setChoiceOpen(true); }
  function onChooseFinancial() { setChoiceOpen(false); setDonationOpen(true); }
  function onChooseSkill() { setChoiceOpen(false); setSkillOpen(true); }

  const pct = project.goalAmount > 0
    ? Math.round((project.raisedAmount / project.goalAmount) * 100)
    : 0;
  const completedMilestones = project.milestones.filter((m) => m.status === "COMPLETED");

  // Aggregate impact metrics from completed milestone output markers
  const allOutputMarkers: { label: string; value: string }[] = [];
  for (const m of completedMilestones) {
    for (const om of m.outputMarkers) {
      allOutputMarkers.push({ label: om.label, value: `${om.value}${om.unit ? " " + om.unit : ""}` });
    }
  }
  const impactMetrics = allOutputMarkers.slice(0, 3);

  // Collect all evidence files from completed milestones
  const proofGallery = completedMilestones.flatMap((m) =>
    m.evidenceFiles.map((f) => ({
      label: f.fileName,
      type: f.fileType.toUpperCase().includes("PDF") ? "PDF" : "FILE",
      milestone: m.name,
      url: f.url,
    }))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {choiceOpen && (
        <ContributionChoiceModal
          onClose={() => setChoiceOpen(false)}
          onFinancial={onChooseFinancial}
          onSkill={onChooseSkill}
          hasRoles={project.ngoRoles.length > 0}
        />
      )}
      {donationOpen && (
        <DonationModal
          projectTitle={project.title}
          projectId={project.id}
          onClose={() => setDonationOpen(false)}
        />
      )}
      {skillOpen && (
        <SkillContributionModal
          ngoName={project.ngo.orgName}
          roles={project.ngoRoles}
          onClose={() => setSkillOpen(false)}
        />
      )}

      <Link href="/projects">
        <Button variant="ghost" size="sm" className="mb-4 flex items-center gap-2 text-gray-500">
          <ArrowLeft className="w-4 h-4" /> All Projects
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero card */}
          <Card>
            <div className="h-56 bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center rounded-t-xl text-7xl">
              {project.image}
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Link
                  href={`/projects?category=${project.category}`}
                  className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5 text-xs font-semibold hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                >
                  {categoryLabel[project.category] ?? project.category}
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.title}</h1>
              <Link href={`/ngo/${project.ngo.id}`} className="text-emerald-700 font-medium text-sm mb-4 hover:underline block">
                {project.ngo.orgName}
              </Link>
              <Progress value={pct} className="mb-3" />
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span className="font-bold text-gray-900 text-lg">${project.raisedAmount.toLocaleString()}</span>
                <span className="text-gray-400">of ${project.goalAmount.toLocaleString()} goal</span>
              </div>
              <div className="flex gap-6 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{project.donorCount} donors</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{project.daysLeft} days left</span>
                <span className="flex items-center gap-1 text-emerald-700"><Shield className="w-4 h-4" />Verified NGO</span>
              </div>
              <div className="flex gap-3">
                <Button size="lg" className="flex-1" onClick={openContribute}>
                  Contribute to This Project
                </Button>
                <SpotlightVoteButton projectId={project.id} />
              </div>
              <div className="mt-3">
                <Link href={`/campaigns/new?project=${project.id}`}>
                  <Button variant="outline" size="sm" className="w-full gap-2 text-purple-700 border-purple-200 hover:bg-purple-50">
                    <Gift className="w-4 h-4" />
                    Start a Fundraising Campaign for This Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-gray-900 mb-4">About This Project</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {project.description}
              </div>
            </CardContent>
          </Card>

          {/* NGO Story */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {project.ngo.orgName[0]}
                </div>
                <div>
                  <Link href={`/ngo/${project.ngo.id}`} className="font-bold text-gray-900 hover:underline">
                    {project.ngo.orgName}
                  </Link>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />Est. {project.ngo.foundedYear}
                    </span>
                    {project.ngo.country && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />{project.ngo.country}
                      </span>
                    )}
                    {project.ngo.website && (
                      <a
                        href={project.ngo.website.startsWith("http") ? project.ngo.website : `https://${project.ngo.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-600 hover:underline"
                      >
                        {project.ngo.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {project.ngo.description ? (
                <p className="text-sm text-gray-600 leading-relaxed">{project.ngo.description}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  {project.ngo.orgName} is a verified NGO on GiveLedger. Their projects are milestone-tracked and all fund releases are recorded on-chain.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Board Members */}
          {project.ngo.boardMembers.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Board &amp; Leadership
                  </h2>
                  <a
                    href={`/ngo/${project.ngo.id}`}
                    className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    View NGO profile <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.ngo.boardMembers.map((m) => (
                    <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      {m.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.photoUrl}
                          alt={m.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-emerald-700">
                            {m.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                        <p className="text-xs font-medium text-emerald-700">{m.role}</p>
                        {m.bio && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{m.bio}</p>
                        )}
                        {m.linkedinUrl && (
                          <a
                            href={m.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5"
                          >
                            <Linkedin className="w-3 h-3" /> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Milestone tracker */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-gray-900 mb-5">Milestone Tracker</h2>
              <div className="space-y-4">
                {project.milestones.map((m, i) => (
                  <div key={m.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {m.status === "COMPLETED" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : m.status === "UNDER_REVIEW" ? (
                        <Circle className="w-5 h-5 text-amber-500 fill-amber-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-200" />
                      )}
                      {i < project.milestones.length - 1 && (
                        <div className={`w-0.5 h-full mt-1 ${m.status === "COMPLETED" ? "bg-emerald-200" : "bg-gray-100"}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              m.status === "COMPLETED"
                                ? "text-gray-700"
                                : m.status === "UNDER_REVIEW"
                                ? "text-amber-800"
                                : "text-gray-400"
                            }`}
                          >
                            {m.name}
                          </p>
                          {m.targetDate && (
                            <p className="text-xs text-gray-400 mt-0.5">{m.targetDate}</p>
                          )}
                          {m.metric && m.status === "COMPLETED" && (
                            <p className="text-xs text-emerald-700 font-medium mt-1">{m.metric}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              m.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-700"
                                : m.status === "UNDER_REVIEW"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {m.status === "COMPLETED"
                              ? "Complete"
                              : m.status === "UNDER_REVIEW"
                              ? "Under Review"
                              : "Pending"}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            ${m.requiredAmount.toLocaleString()} release
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {m.txHash && (
                          <a
                            href={`https://polygonscan.com/tx/${m.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                          >
                            View on Polygon <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {m.status === "COMPLETED" && m.metric && (
                          <ShareMilestoneCard
                            milestoneId={m.id}
                            milestoneName={m.name}
                            projectTitle={project.title}
                            ngoName={project.ngo.orgName}
                            metric={m.metric}
                            txHash={m.txHash ?? undefined}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Proof Gallery */}
          {proofGallery.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  Evidence & Proof Gallery
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  All files submitted by the NGO and reviewed by GiveLedger before fund release
                </p>
                <div className="space-y-2">
                  {proofGallery.map((file, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded text-white ${
                            file.type === "PDF" ? "bg-red-400" : "bg-blue-400"
                          }`}
                        >
                          {file.type}
                        </span>
                        <div>
                          <p className="text-sm text-gray-700">{file.label}</p>
                          <p className="text-xs text-gray-400">{file.milestone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-medium">Verified</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance documents */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Compliance & Trust Documents
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Reviewed and verified by the GiveLedger team before NGO was approved
              </p>
              <div className="space-y-2">
                {[
                  "NGO Registration Certificate",
                  "Annual Audit Report",
                  "Board Resolution",
                ].map((doc) => (
                  <div key={doc} className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-700">{doc}</span>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium">Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-5">
              <h3 className="font-semibold text-emerald-900 mb-4">Impact So Far</h3>
              {impactMetrics.length > 0 ? (
                <div className="space-y-3">
                  {impactMetrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-xs text-emerald-700">{m.label}</p>
                      <p className="font-bold text-emerald-900 text-lg">{m.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-700">
                  Impact metrics will appear here as milestones are completed and verified.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Supporters</h3>
                <span className="text-xs text-gray-400">
                  {project.financialLeaderboard.length + project.skillContributors.length} total
                </span>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-1 mb-4 bg-gray-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setSupportersTab("financial")}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                    supportersTab === "financial"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Financial
                  {project.financialLeaderboard.length > 0 && (
                    <span className="ml-1 text-gray-400">{project.financialLeaderboard.length}</span>
                  )}
                </button>
                <button
                  onClick={() => setSupportersTab("skills")}
                  className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                    supportersTab === "skills"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Skills
                  {project.skillContributors.length > 0 && (
                    <span className="ml-1 text-gray-400">{project.skillContributors.length}</span>
                  )}
                </button>
              </div>

              {/* Financial leaderboard */}
              {supportersTab === "financial" && (
                <>
                  {project.financialLeaderboard.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Be the first to donate!</p>
                  ) : (
                    <div className="space-y-2">
                      {project.financialLeaderboard.map((d, i) => (
                        <div
                          key={d.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg ${
                            i === 0 ? "bg-amber-50 border border-amber-100" : ""
                          }`}
                        >
                          {/* Rank */}
                          <div className="w-5 shrink-0 text-center">
                            {i === 0 ? (
                              <Crown className="w-4 h-4 text-amber-500 mx-auto" />
                            ) : (
                              <span className="text-[11px] font-bold text-gray-300">#{i + 1}</span>
                            )}
                          </div>
                          {/* Avatar */}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            i === 0 ? "bg-amber-200 text-amber-800" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {d.name.charAt(0).toUpperCase()}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/donor/${d.id}/profile`}
                              className={`text-xs font-semibold truncate block hover:underline ${i === 0 ? "text-amber-900" : "text-gray-800"}`}
                            >
                              {d.name}
                            </Link>
                            {(d.jobTitle || d.company) && (
                              <p className="text-[10px] text-gray-400 truncate">
                                {[d.jobTitle, d.company].filter(Boolean).join(", ")}
                              </p>
                            )}
                          </div>
                          {/* Amount */}
                          <span className={`text-xs font-bold shrink-0 ${i === 0 ? "text-amber-700" : "text-emerald-700"}`}>
                            ${d.total.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Skills leaderboard */}
              {supportersTab === "skills" && (
                <>
                  {project.skillContributors.length === 0 ? (
                    <div className="text-center py-4">
                      <Briefcase className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">No skill contributors yet.</p>
                      <Link href="/opportunities" className="text-xs text-emerald-600 hover:underline mt-1 inline-block">
                        Browse open roles →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {project.skillContributors.map((c) => (
                        <div key={c.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-violet-50 border border-violet-100">
                          {/* Avatar */}
                          <div className="w-7 h-7 rounded-full bg-violet-200 flex items-center justify-center text-xs font-bold text-violet-800 shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <Link href={`/donor/${c.id}/profile`} className="text-xs font-semibold text-gray-800 truncate block hover:underline">
                              {c.name}
                            </Link>
                            {(c.jobTitle || c.company) && (
                              <p className="text-[10px] text-gray-400 truncate">
                                {[c.jobTitle, c.company].filter(Boolean).join(", ")}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[10px] font-semibold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded-full">
                                {c.skillCategory}
                              </span>
                              {c.hoursContributed != null && (
                                <span className="text-[10px] text-gray-500">{c.hoursContributed}h</span>
                              )}
                              {c.monetaryValue != null && (
                                <span className="text-[10px] font-semibold text-violet-700">
                                  ${c.monetaryValue.toLocaleString()} value
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-emerald-950 text-white">
            <CardContent className="p-5">
              <Shield className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="font-semibold mb-2 text-sm">Trust Guarantee</h3>
              <p className="text-xs text-emerald-300 leading-relaxed">
                Every financial event is recorded on the Polygon blockchain. Funds are released only when milestones are verified by our admin team.
              </p>
            </CardContent>
          </Card>

          {/* Completed milestones — shareable */}
          {completedMilestones.filter((m) => m.metric).length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Share Verified Impact</h3>
                <p className="text-xs text-gray-500 mb-4">
                  These milestones are complete. Share the outcome with your network — proof included.
                </p>
                <div className="space-y-2">
                  {completedMilestones
                    .filter((m) => m.metric)
                    .map((m) => (
                      <div key={m.id} className="p-3 bg-emerald-50 rounded-xl">
                        <p className="text-xs font-medium text-emerald-800 mb-2 line-clamp-2">{m.name}</p>
                        <ShareMilestoneCard
                          milestoneId={m.id}
                          milestoneName={m.name}
                          projectTitle={project.title}
                          ngoName={project.ngo.orgName}
                          metric={m.metric!}
                          txHash={m.txHash ?? undefined}
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button size="lg" className="w-full" onClick={openContribute}>
            Contribute Now
          </Button>
        </div>
      </div>
    </div>
  );
}
