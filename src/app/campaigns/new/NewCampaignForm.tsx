"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Gift, CheckCircle2 } from "lucide-react";

const projects = [
  { id: "1", title: "Clean Water for Kibera Schools", ngo: "WaterBridge Kenya" },
  { id: "2", title: "Livelihood Training - Rural Bihar", ngo: "Pragati Foundation" },
  { id: "3", title: "Elderly Care Home - Mysore", ngo: "SilverYears Trust" },
  { id: "4", title: "Wheelchair Access - Mumbai Slums", ngo: "AccessAbility India" },
  { id: "5", title: "Animal Rescue & Rehabilitation", ngo: "PawsNairobi" },
  { id: "6", title: "Solar Microgrids for Rural Schools", ngo: "SunPower Africa" },
];

export default function NewCampaignForm() {
  const searchParams = useSearchParams();
  const preselectedProject = searchParams.get("project") || "";

  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: preselectedProject,
    goal: "",
    daysRunning: "30",
  });
  const [submitted, setSubmitted] = useState(false);
  const [campaignId, setCampaignId] = useState("");

  const selectedProject = projects.find((p) => p.id === form.projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate a unique slug: project id + short random hex
    const slug = `c-${form.projectId}-${Math.random().toString(16).slice(2, 8)}`;
    setCampaignId(slug);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Campaign Created!</h1>
          <p className="text-gray-500 mb-2">
            Your campaign <strong>"{form.title}"</strong> is live.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Share the link with your network to start collecting contributions toward{" "}
            <strong>{selectedProject?.title}</strong>.
          </p>
          <div className="bg-gray-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">Your campaign link</p>
            <p className="font-mono text-sm text-gray-800 break-all">
              https://give-ledger.vercel.app/campaigns/{campaignId}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/campaigns">
              <Button className="w-full">Back to Campaigns</Button>
            </Link>
            <Link href="/donor/dashboard">
              <Button variant="outline" className="w-full">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Start a Campaign</h1>
            <p className="text-sm text-gray-500">Fundraise for a project you believe in</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project selection */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Which project is this campaign for? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {projects.map((p) => (
                  <label key={p.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.projectId === p.id ? "bg-purple-50 border-purple-300" : "border-gray-200 hover:border-purple-200"}`}>
                    <input
                      type="radio"
                      name="project"
                      value={p.id}
                      checked={form.projectId === p.id}
                      onChange={() => setForm({ ...form, projectId: p.id })}
                      className="mt-1 accent-purple-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.ngo}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Campaign details */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Campaign title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Help us fund the last phase of Kibera Water"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Why are you running this campaign? <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">Tell your network why this project matters to you</p>
                <textarea
                  required
                  rows={4}
                  placeholder="I've seen the impact of this project firsthand. Here's why I think you should support it..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fundraising goal (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      required
                      min="100"
                      placeholder="5000"
                      value={form.goal}
                      onChange={(e) => setForm({ ...form, goal: e.target.value })}
                      className="w-full h-11 rounded-xl border border-gray-200 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Run for (days)</label>
                  <select
                    value={form.daysRunning}
                    onChange={(e) => setForm({ ...form, daysRunning: e.target.value })}
                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {[7, 14, 21, 30, 45, 60].map((d) => (
                      <option key={d} value={d}>{d} days</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-800">
            All funds raised through your campaign go directly to the selected project — milestone-locked on GiveLedger. Contributors will see the same on-chain proof trail as direct donors.
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-purple-700 hover:bg-purple-800 gap-2"
            disabled={!form.projectId || !form.title || !form.description || !form.goal}
          >
            <Gift className="w-5 h-5" />
            Launch Campaign
          </Button>
        </form>
      </div>
    </div>
  );
}
