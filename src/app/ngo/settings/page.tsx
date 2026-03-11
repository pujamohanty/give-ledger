import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Bell, Shield, FileText } from "lucide-react";

export default function NgoSettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your NGO profile, documents, and notification preferences.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* NGO Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              NGO Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ngoName">Organisation name</Label>
              <Input id="ngoName" placeholder="WaterBridge Kenya" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="regNumber">Registration number</Label>
                <Input id="regNumber" placeholder="NGO/2023/00123" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input id="country" placeholder="Kenya" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input id="website" type="url" placeholder="https://waterbridgekenya.org" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Short description</Label>
              <textarea
                id="description"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Describe your NGO's mission and work..."
              />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Verification Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Registration certificate", status: "Uploaded", statusColor: "text-emerald-700 bg-emerald-50" },
              { label: "Tax exemption certificate", status: "Uploaded", statusColor: "text-emerald-700 bg-emerald-50" },
              { label: "Annual report (latest)", status: "Missing", statusColor: "text-amber-700 bg-amber-50" },
            ].map((doc) => (
              <div key={doc.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{doc.label}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${doc.statusColor}`}>
                    {doc.status}
                  </span>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    {doc.status === "Missing" ? "Upload" : "Replace"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "New donation received", desc: "Get notified whenever a donor contributes to your project" },
              { label: "Milestone approved", desc: "Get notified when admin approves a milestone submission" },
              { label: "Disbursement released", desc: "Get notified when funds are released to your account" },
              { label: "Project status updates", desc: "Get notified when your project status changes" },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Account & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Account role</p>
                <p className="text-xs text-gray-500 mt-0.5">NGO — create and manage projects</p>
              </div>
              <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                NGO
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Approval status</p>
                <p className="text-xs text-gray-500 mt-0.5">Your NGO has been verified by the platform</p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                Approved
              </span>
            </div>
            <div className="pt-2">
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 w-full">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
