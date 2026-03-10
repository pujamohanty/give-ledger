"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Info } from "lucide-react";

const categories = [
  { value: "INCOME_GENERATION", label: "Income Generation" },
  { value: "CHILD_CARE", label: "Child Care" },
  { value: "ELDERLY_CARE", label: "Elderly Care" },
  { value: "PHYSICALLY_DISABLED", label: "Accessibility" },
  { value: "PET_CARE", label: "Animal Welfare" },
  { value: "OTHER", label: "Other" },
];

interface Milestone {
  name: string;
  description: string;
  targetDate: string;
  requiredAmount: string;
}

export default function NewProjectPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { name: "", description: "", targetDate: "", requiredAmount: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const addMilestone = () => {
    if (milestones.length < 10) {
      setMilestones([...milestones, { name: "", description: "", targetDate: "", requiredAmount: "" }]);
    }
  };

  const removeMilestone = (i: number) => {
    setMilestones(milestones.filter((_, idx) => idx !== i));
  };

  const updateMilestone = (i: number, field: keyof Milestone, value: string) => {
    setMilestones(milestones.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Your project is now under admin review. You will receive an email notification
            within 48 hours once approved.
          </p>
          <Link href="/ngo/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/ngo/dashboard">
          <Button variant="ghost" size="sm" className="mb-4 flex items-center gap-2 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-500 text-sm mt-1">
          Projects are reviewed by our team before going live. Define clear milestones
          to build donor trust.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Clean Water for Kibera Schools"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                className="mt-1 flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="description">Project Description *</Label>
              <textarea
                id="description"
                rows={4}
                placeholder="Describe your project, the problem it solves, and the community it serves..."
                className="mt-1 flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goalAmount">Funding Goal (USD) *</Label>
                <Input
                  id="goalAmount"
                  type="number"
                  min="500"
                  placeholder="25000"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="mt-1 flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Milestones *</CardTitle>
              <span className="text-xs text-gray-400">{milestones.length}/10</span>
            </div>
            <div className="flex items-start gap-2 bg-emerald-50 rounded-lg p-3 mt-2">
              <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800">
                Milestones are the heart of donor trust. Each milestone defines what you
                will deliver and how much funding will be released upon verified completion.
                Funds are NOT released until you submit evidence and an admin approves it.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestones.map((milestone, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Milestone {i + 1}
                  </span>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(i)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <Label>Milestone Name *</Label>
                  <Input
                    placeholder="e.g. Equipment procurement"
                    value={milestone.name}
                    onChange={(e) => updateMilestone(i, "name", e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>Deliverable Description *</Label>
                  <textarea
                    rows={2}
                    placeholder="What will you deliver? How will success be measured?"
                    value={milestone.description}
                    onChange={(e) => updateMilestone(i, "description", e.target.value)}
                    className="mt-1 flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Target Date *</Label>
                    <Input
                      type="date"
                      value={milestone.targetDate}
                      onChange={(e) => updateMilestone(i, "targetDate", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Fund Release Amount (USD) *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="5000"
                      value={milestone.requiredAmount}
                      onChange={(e) => updateMilestone(i, "requiredAmount", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            {milestones.length < 10 && (
              <button
                type="button"
                onClick={addMilestone}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Another Milestone
              </button>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? "Submitting for Review..." : "Submit Project for Review"}
          </Button>
          <Link href="/ngo/dashboard">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center">
          After submission, our team will review your project within 48 hours.
          You will be notified by email.
        </p>
      </form>
    </div>
  );
}
