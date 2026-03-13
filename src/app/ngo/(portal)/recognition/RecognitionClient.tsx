"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Heart, CheckCircle2, ChevronDown, ChevronUp, Star } from "lucide-react";

export type DonorSummary = {
  id: string;
  name: string | null;
  email: string;
  totalDonated: number;
  donationCount: number;
  approvedSkillCount: number;
  endorsementCount: number;
  existingEndorsement: {
    note: string | null;
    category: string;
  } | null;
};

type Props = {
  donors: DonorSummary[];
};

const CATEGORIES = [
  { value: "GENERAL", label: "General" },
  { value: "FINANCIAL", label: "Financial Impact" },
  { value: "SKILL", label: "Skill Contribution" },
  { value: "COMMUNITY_IMPACT", label: "Community Impact" },
];

function EndorseForm({
  donor,
  onSuccess,
}: {
  donor: DonorSummary;
  onSuccess: (endorsement: { note: string | null; category: string }) => void;
}) {
  const [note, setNote] = useState(donor.existingEndorsement?.note ?? "");
  const [category, setCategory] = useState(donor.existingEndorsement?.category ?? "GENERAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEndorse() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/endorsements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donorId: donor.id, note: note.trim(), category }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save endorsement.");
        return;
      }
      onSuccess({ note: note.trim() || null, category });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 pt-3 border-t border-gray-100">
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                category === c.value
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-gray-200 text-gray-600 hover:border-emerald-400"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Note (optional)</label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Rahul has been a consistent supporter of our water access programme — his contributions directly funded Milestone 2."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
        onClick={handleEndorse}
        disabled={loading}
      >
        <Award className="w-3 h-3 mr-1" />
        {loading ? "Saving..." : donor.existingEndorsement ? "Update Endorsement" : "Endorse Donor"}
      </Button>
    </div>
  );
}

export default function RecognitionClient({ donors }: Props) {
  const [donorState, setDonorState] = useState<DonorSummary[]>(donors);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalEndorsed = donorState.filter((d) => d.endorsementCount > 0).length;

  function handleEndorsementSuccess(
    donorId: string,
    endorsement: { note: string | null; category: string }
  ) {
    setDonorState((prev) =>
      prev.map((d) =>
        d.id === donorId
          ? {
              ...d,
              existingEndorsement: endorsement,
              endorsementCount: d.existingEndorsement ? d.endorsementCount : d.endorsementCount + 1,
            }
          : d
      )
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Donor Recognition</h1>
        <p className="text-gray-500 text-sm mt-1">
          Recognise donors who have made a meaningful difference. Endorsements are visible on their impact profiles.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Donors", value: donorState.length.toString() },
          { label: "Endorsed", value: totalEndorsed.toString() },
          { label: "Yet to Endorse", value: (donorState.length - totalEndorsed).toString() },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {donorState.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No donors yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Donors will appear here once they contribute to your projects.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Donors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {donorState.map((donor) => (
              <div key={donor.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === donor.id ? null : donor.id)}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-emerald-700">
                        {(donor.name ?? donor.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {donor.name ?? donor.email}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          ${donor.totalDonated.toLocaleString()} donated
                        </span>
                        {donor.approvedSkillCount > 0 && (
                          <span className="text-xs text-emerald-700">
                            {donor.approvedSkillCount} skill contribution{donor.approvedSkillCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {donor.existingEndorsement ? (
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Endorsed
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Endorse
                      </Badge>
                    )}
                    {expandedId === donor.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedId === donor.id && (
                  <div className="px-4 pb-4">
                    {donor.existingEndorsement && (
                      <div className="mb-3 p-3 bg-emerald-50 rounded-lg">
                        <p className="text-xs font-medium text-emerald-800 mb-1">
                          Current endorsement — {
                            CATEGORIES.find((c) => c.value === donor.existingEndorsement!.category)?.label
                          }
                        </p>
                        {donor.existingEndorsement.note && (
                          <p className="text-xs text-emerald-700 italic">
                            &quot;{donor.existingEndorsement.note}&quot;
                          </p>
                        )}
                      </div>
                    )}
                    <EndorseForm
                      donor={donor}
                      onSuccess={(e) => handleEndorsementSuccess(donor.id, e)}
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
