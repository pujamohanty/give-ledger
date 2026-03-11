import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, DollarSign, Shield, Bell, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-600" /> Platform Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">Configure platform-wide rules, fees, and operational settings.</p>
      </div>

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
                <Input id="platformFee" type="number" defaultValue="2.5" step="0.5" min="0" max="10" />
                <p className="text-xs text-gray-400">Deducted from each donation before project allocation.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stripeFee">Stripe processing fee (%)</Label>
                <Input id="stripeFee" type="number" defaultValue="2.9" disabled className="bg-gray-50 text-gray-500" />
                <p className="text-xs text-gray-400">Fixed by Stripe. Not editable.</p>
              </div>
            </div>
            <Button>Save Fee Settings</Button>
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
              <Input id="minDocs" type="number" defaultValue="3" min="1" max="10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reviewWindow">Review window (hours)</Label>
              <Input id="reviewWindow" type="number" defaultValue="48" min="12" max="168" />
              <p className="text-xs text-gray-400">Target SLA for reviewing NGO applications.</p>
            </div>
            {[
              { label: "Require registration certificate", defaultChecked: true },
              { label: "Require tax exemption certificate", defaultChecked: true },
              { label: "Require annual financial report", defaultChecked: false },
              { label: "Allow international NGOs", defaultChecked: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <input type="checkbox" id={item.label} defaultChecked={item.defaultChecked} className="w-4 h-4 accent-emerald-600" />
                <label htmlFor={item.label} className="text-sm text-gray-700">{item.label}</label>
              </div>
            ))}
            <Button>Save NGO Rules</Button>
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
                <Input id="maxDisburse" type="number" defaultValue="50000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disburseWindow">Evidence review window (hours)</Label>
                <Input id="disburseWindow" type="number" defaultValue="72" />
              </div>
            </div>
            {[
              { label: "Require photo evidence for all milestone approvals", defaultChecked: true },
              { label: "Require completion narrative report", defaultChecked: true },
              { label: "Auto-approve disbursements under $500", defaultChecked: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <input type="checkbox" id={item.label} defaultChecked={item.defaultChecked} className="w-4 h-4 accent-emerald-600" />
                <label htmlFor={item.label} className="text-sm text-gray-700">{item.label}</label>
              </div>
            ))}
            <Button>Save Disbursement Rules</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" /> Admin Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="adminEmail">Admin alert email</Label>
              <Input id="adminEmail" type="email" defaultValue="admin@giveledger.com" />
            </div>
            {[
              { label: "Email alert on new NGO application", defaultChecked: true },
              { label: "Email alert on new disbursement request", defaultChecked: true },
              { label: "Daily summary email", defaultChecked: false },
              { label: "Alert on large donations (>$5,000)", defaultChecked: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <input type="checkbox" id={item.label} defaultChecked={item.defaultChecked} className="w-4 h-4 accent-emerald-600" />
                <label htmlFor={item.label} className="text-sm text-gray-700">{item.label}</label>
              </div>
            ))}
            <Button>Save Notification Settings</Button>
          </CardContent>
        </Card>

        {/* Platform Info */}
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
              { label: "Blockchain network", value: "Polygon (Mock — v1.1)" },
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
