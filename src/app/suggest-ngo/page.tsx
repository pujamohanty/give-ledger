"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Leaf, CheckCircle2, Search } from "lucide-react";

const categories = [
  "Child Care", "Income Generation / Livelihoods", "Elderly Care",
  "Accessibility & Disability", "Animal Welfare", "Education",
  "Healthcare", "Environment / Climate", "Women's Empowerment", "Other",
];

export default function SuggestNgoPage() {
  const [form, setForm] = useState({
    orgName: "",
    website: "",
    country: "",
    category: "",
    reason: "",
    contactName: "",
    contactEmail: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Suggestion Submitted!</h1>
          <p className="text-gray-500 mb-2">Thank you for suggesting <strong>{form.orgName}</strong>.</p>
          <p className="text-sm text-gray-400 mb-8">
            Our team reviews all NGO suggestions within 5–7 working days. We'll verify their registration, financials, and milestone reporting capability before reaching out.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/projects"><Button className="w-full">Browse Existing Projects</Button></Link>
            <Link href="/suggest-ngo"><Button variant="outline" className="w-full">Suggest Another NGO</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suggest an NGO</h1>
            <p className="text-sm text-gray-500">Know a great organisation that deserves to be on GiveLedger?</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 mb-8 mt-4">
          <div className="flex items-start gap-3">
            <Leaf className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-800">
              <p className="font-semibold mb-1">What we look for in NGOs</p>
              <ul className="space-y-1 text-emerald-700">
                <li>• Registered organisation with publicly verifiable status</li>
                <li>• Willingness to work with milestone-locked fund releases</li>
                <li>• Ability to provide documentary evidence for each milestone</li>
                <li>• Track record of delivery (at least 1 completed project)</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <h2 className="font-semibold text-gray-900">About the NGO</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Organisation name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WaterBridge Kenya"
                  value={form.orgName}
                  onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                  className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Website</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Country of operation</label>
                  <input
                    type="text"
                    placeholder="e.g. India, Kenya"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Cause category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Why should this NGO be on GiveLedger? <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">Tell us what you know about their work and why they'd be a good fit</p>
                <textarea
                  required
                  rows={4}
                  placeholder="I've seen their work in Nairobi firsthand — they consistently deliver and document everything. Their volunteer team is transparent and responsive..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <h2 className="font-semibold text-gray-900">Your contact (optional)</h2>
              <p className="text-xs text-gray-400 -mt-3">We may reach out if we need more information</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Your name</label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Your email</label>
                  <input
                    type="email"
                    placeholder="Optional"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={!form.orgName || !form.reason}
          >
            Submit Suggestion
          </Button>

          <p className="text-xs text-gray-400 text-center">
            We review all suggestions within 5–7 working days. Not all NGOs will meet our criteria.
          </p>
        </form>
      </div>
    </div>
  );
}
