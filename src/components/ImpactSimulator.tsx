"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Users, CheckCircle2, DollarSign } from "lucide-react";

// Impact estimates by category (impact per $100 donated)
const IMPACT_RATES = {
  water: { label: "Clean Water Access", unit: "students", ratePerHundred: 1.8 },
  training: { label: "Vocational Training", unit: "women", ratePerHundred: 0.25 },
  elderly: { label: "Elderly Care", unit: "residents", ratePerHundred: 0.6 },
  accessibility: { label: "Accessibility", unit: "people", ratePerHundred: 0.8 },
};

export default function ImpactSimulator() {
  const [amount, setAmount] = useState(250);

  const results = Object.values(IMPACT_RATES).map((rate) => ({
    label: rate.label,
    unit: rate.unit,
    value: Math.round((amount / 100) * rate.ratePerHundred * 10) / 10,
  }));

  const milestonesUnlocked = Math.max(1, Math.floor(amount / 150));

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-600" />
          Impact Simulator
        </CardTitle>
        <p className="text-xs text-gray-500">See how much further your next donation could go</p>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Donation amount</label>
            <span className="text-xl font-bold text-emerald-700">${amount}</span>
          </div>
          <input
            type="range"
            min={50}
            max={2000}
            step={50}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>$50</span>
            <span>$2,000</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          {results.map((r) => (
            <div key={r.label} className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-lg font-bold text-gray-900">{r.value} <span className="text-sm font-normal text-gray-500">{r.unit}</span></p>
              <p className="text-xs text-gray-400 mt-0.5">{r.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm text-emerald-800">
            A <strong>${amount}</strong> donation could unlock approximately{" "}
            <strong>{milestonesUnlocked} milestone{milestonesUnlocked > 1 ? "s" : ""}</strong> across your funded projects — with every rupee tracked on-chain.
          </p>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Estimates based on historical project data. Actual impact varies per project.
        </p>
      </CardContent>
    </Card>
  );
}
