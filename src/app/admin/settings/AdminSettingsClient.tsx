"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, DollarSign, Shield, Bell, Globe, CheckCircle2 } from "lucide-react";

type Props = { initialSettings: Record<string, string> };

function val(settings: Record<string, string>, key: string, fallback: string) {
  return settings[key] ?? fallback;
}

export default function AdminSettingsClient({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function save(section: string, keys: string[]) {
    setSaving(section);
    setError(null);
    const body: Record<string, string> = {};
    for (const k of keys) body[k] = settings[k] ?? "";

    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(null);
    if (res.ok) {
      setSaved(section);
      setTimeout(() => setSaved(null), 3000);
    } else {
      setError("Failed to save. Please try again.");
    }
  }

  function SaveButton({ section, keys }: { section: string; keys: string[] }) {
    const isSaving = saving === section;
    const isSaved = saved === section;
    return (
      <div className="flex items-center gap-3">
        <Button
          onClick={() => save(section, keys)}
          disabled={!!saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
        {isSaved && (
          <span className="flex items-center gap-1 text-xs text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-600" /> Platform Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">Configure platform-wide rules, fees, and operational settings.</p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="max-w-2xl space-y-6">

        {/* Platform Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Platform Fees
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="platformFee">Platform fee (%)</Label>
                <Input
                  id="platformFee"
                  type="number"
                  value={val(settings, "platform_fee_pct", "2.5")}
                  onChange={(e) => set("platform_fee_pct", e.target.value)}
                  step="0.5" min="0" max="10"
                />
                <p className="text-xs text-gray-400">Deducted from each donation before project allocation.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stripeFee">Stripe processing fee (%)</Label>
                <Input id="stripeFee" type="number" defaultValue="2.9" disabled className="bg-gray-50 text-gray-500" />
                <p className="text-xs text-gray-400">Fixed by Stripe. Not editable.</p>
              </div>
            </div>
            <SaveButton section="fees" keys={["platform_fee_pct"]} />
          </CardContent>
        </Card>

        {/* NGO Approval Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> NGO Approval Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="minDocs">Minimum documents required for approval</Label>
              <Input
                id="minDocs"
                type="number"
                value={val(settings, "ngo_min_docs", "3")}
                onChange={(e) => set("ngo_min_docs", e.target.value)}
                min="1" max="10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reviewWindow">Review window (hours)</Label>
              <Input
                id="reviewWindow"
                type="number"
                value={val(settings, "ngo_review_window_hrs", "48")}
                onChange={(e) => set("ngo_review_window_hrs", e.target.value)}
                min="12" max="168"
              />
              <p className="text-xs text-gray-400">Target SLA for reviewing NGO applications.</p>
            </div>
            {[
              { label: "Require registration certificate", key: "ngo_require_reg_cert" },
              { label: "Require tax exemption certificate", key: "ngo_require_tax_cert" },
              { label: "Require annual financial report", key: "ngo_require_annual_report" },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={item.key}
                  checked={val(settings, item.key, item.key === "ngo_require_annual_report" ? "false" : "true") === "true"}
                  onChange={(e) => set(item.key, String(e.target.checked))}
                  className="w-4 h-4 accent-emerald-600"
                />
                <label htmlFor={item.key} className="text-sm text-gray-700">{item.label}</label>
              </div>
            ))}
            <SaveButton section="ngo_rules" keys={["ngo_min_docs", "ngo_review_window_hrs", "ngo_require_reg_cert", "ngo_require_tax_cert", "ngo_require_annual_report"]} />
          </CardContent>
        </Card>

        {/* Disbursement Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Disbursement Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="maxDisburse">Max single disbursement ($)</Label>
                <Input
                  id="maxDisburse"
                  type="number"
                  value={val(settings, "disburse_max_usd", "50000")}
                  onChange={(e) => set("disburse_max_usd", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disburseWindow">Evidence review window (hours)</Label>
                <Input
                  id="disburseWindow"
                  type="number"
                  value={val(settings, "disburse_review_window_hrs", "72")}
                  onChange={(e) => set("disburse_review_window_hrs", e.target.value)}
                />
              </div>
            </div>
            {[
              { label: "Require photo evidence for all milestone approvals", key: "disburse_require_photo" },
              { label: "Require completion narrative report", key: "disburse_require_narrative" },
              { label: "Auto-approve disbursements under $500", key: "disburse_auto_approve_under_500" },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={item.key}
                  checked={val(settings, item.key, item.key === "disburse_auto_approve_under_500" ? "false" : "true") === "true"}
                  onChange={(e) => set(item.key, String(e.target.checked))}
                  className="w-4 h-4 accent-emerald-600"
                />
                <label htmlFor={item.key} className="text-sm text-gray-700">{item.label}</label>
              </div>
            ))}
            <SaveButton section="disburse_rules" keys={["disburse_max_usd", "disburse_review_window_hrs", "disburse_require_photo", "disburse_require_narrative", "disburse_auto_approve_under_500"]} />
          </CardContent>
        </Card>

        {/* Admin Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" /> Admin Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="adminEmail">Admin alert email</Label>
              <Input
                id="adminEmail"
                type="email"
                value={val(settings, "admin_alert_email", "admin@giveledger.com")}
                onChange={(e) => set("admin_alert_email", e.target.value)}
              />
            </div>
            {[
              { label: "Email alert on new NGO application", key: "notify_new_ngo_app" },
              { label: "Email alert on new disbursement request", key: "notify_new_disburse" },
              { label: "Daily summary email", key: "notify_daily_summary" },
              { label: "Alert on large donations (>$5,000)", key: "notify_large_donation" },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={item.key}
                  checked={val(settings, item.key, item.key === "notify_daily_summary" ? "false" : "true") === "true"}
                  onChange={(e) => set(item.key, String(e.target.checked))}
                  className="w-4 h-4 accent-emerald-600"
                />
                <label htmlFor={item.key} className="text-sm text-gray-700">{item.label}</label>
              </div>
            ))}
            <SaveButton section="notifications" keys={["admin_alert_email", "notify_new_ngo_app", "notify_new_disburse", "notify_daily_summary", "notify_large_donation"]} />
          </CardContent>
        </Card>

        {/* Platform Info — read-only */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" /> Platform Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Platform name", value: "GiveLedger" },
              { label: "Version", value: "1.0.0 (MVP)" },
              { label: "Blockchain network", value: "Polygon (Mock — live deployment pending)" },
              { label: "Payment processor", value: "Stripe v20" },
              { label: "Database", value: "PostgreSQL (Supabase)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="text-sm font-medium text-gray-900">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
