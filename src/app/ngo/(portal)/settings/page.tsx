import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Shield, FileText, CheckCircle2, Link as LinkIcon } from "lucide-react";
import BoardMembersClient from "./BoardMembersClient";
import DeleteAccountButton from "./DeleteAccountButton";
import Link from "next/link";

const STATE_LABELS: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "D.C.",
};

const DOC_CATEGORY_LABEL: Record<string, string> = {
  PROJECT: "Past Project",
  GALLERY: "Gallery",
  REPORT: "Impact Report",
  LEGAL: "Legal",
  FOUNDER: "Founder Bio",
  OTHER: "Document",
};

export default async function NgoSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { saved } = await searchParams;

  const ngo = await prisma.ngo.findUnique({
    where: { userId: session.user.id },
    include: {
      boardMembers: { orderBy: { orderIndex: "asc" } },
      documents: {
        select: { id: true, fileName: true, category: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ngo) redirect("/login");

  // Server action — saves NGO profile fields directly via Prisma
  async function saveProfile(formData: FormData) {
    "use server";
    const session2 = await auth();
    if (!session2?.user?.id) return;

    const orgName = (formData.get("orgName") as string)?.trim();
    const ein = (formData.get("ein") as string)?.trim();
    const state = (formData.get("state") as string)?.trim();
    const website = (formData.get("website") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();

    const ngoRow = await prisma.ngo.findUnique({ where: { userId: session2.user.id } });
    if (!ngoRow) return;

    await prisma.ngo.update({
      where: { id: ngoRow.id },
      data: {
        ...(orgName && { orgName }),
        ein: ein || null,
        state: state || null,
        website: website || null,
        description: description || null,
      },
    });
    redirect("/ngo/settings?saved=1");
  }

  const statusConfig: Record<string, { label: string; color: string; desc: string }> = {
    ACTIVE: { label: "Active", color: "text-emerald-700 bg-emerald-50", desc: "Your NGO is verified and live on the platform" },
    PENDING: { label: "Pending Review", color: "text-amber-700 bg-amber-50", desc: "Your application is under review by the GiveLedger team" },
    SUSPENDED: { label: "Suspended", color: "text-red-700 bg-red-50", desc: "Your account has been suspended. Contact support." },
    REJECTED: { label: "Rejected", color: "text-gray-700 bg-gray-100", desc: "Your application was not approved. Contact support to appeal." },
  };
  const statusInfo = statusConfig[ngo.status] ?? statusConfig["PENDING"];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your NGO profile, board members, and account settings.
        </p>
      </div>

      {saved === "1" && (
        <div className="mb-6 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Changes saved successfully.
        </div>
      )}

      <div className="max-w-2xl space-y-6">

        {/* NGO Profile — server action form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              🏢 NGO Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveProfile} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-800">
                GiveLedger is currently available for <strong>US-based 501(c)(3) nonprofits only</strong>.
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="orgName">Organisation name</Label>
                <Input id="orgName" name="orgName" defaultValue={ngo.orgName} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ein">EIN (Employer Identification Number)</Label>
                  <Input id="ein" name="ein" defaultValue={ngo.ein ?? ""} placeholder="12-3456789" />
                  <p className="text-xs text-gray-400">Format: XX-XXXXXXX</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State of registration</Label>
                  <select
                    id="state"
                    name="state"
                    defaultValue={ngo.state ?? ""}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">Select state…</option>
                    {Object.entries(STATE_LABELS).sort((a, b) => a[1].localeCompare(b[1])).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="taxStatus">Tax-exempt status</Label>
                <Input id="taxStatus" defaultValue="501(c)(3)" readOnly className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400">Only 501(c)(3) organizations are eligible to list on GiveLedger.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" type="url" defaultValue={ngo.website ?? ""} placeholder="https://yourorg.org" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Short description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={ngo.description ?? ""}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Describe your NGO's mission and work…"
                />
              </div>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Board Members — interactive client component */}
        <BoardMembersClient
          initialMembers={ngo.boardMembers.map((m) => ({
            id: m.id,
            name: m.name,
            role: m.role,
            bio: m.bio,
            linkedinUrl: m.linkedinUrl,
            photoUrl: m.photoUrl,
            orderIndex: m.orderIndex,
          }))}
        />

        {/* Verification Documents — real data from DB */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Verification Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ngo.documents.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No documents uploaded yet.</p>
                <Link
                  href="/ngo/org-profile"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-700 hover:underline font-medium"
                >
                  <LinkIcon className="w-3 h-3" /> Upload documents in Org Profile
                </Link>
              </div>
            ) : (
              <>
                {ngo.documents.slice(0, 6).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 truncate flex-1 mr-3">{doc.fileName}</p>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                      {DOC_CATEGORY_LABEL[doc.category] ?? doc.category}
                    </span>
                  </div>
                ))}
                <Link
                  href="/ngo/org-profile"
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline font-medium"
                >
                  <LinkIcon className="w-3 h-3" /> Manage all documents in Org Profile
                </Link>
              </>
            )}
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
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800">
              Email notifications are coming soon. Notifications currently appear in-app only.
            </div>
            {[
              { label: "New donation received", desc: "Get notified whenever a donor contributes to your project" },
              { label: "Milestone funds released", desc: "Get notified when funds are disbursed after milestone completion" },
              { label: "New role application", desc: "Get notified when someone applies to one of your open roles" },
              { label: "Project status updates", desc: "Get notified when your project status changes" },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4 opacity-60">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-not-allowed mt-0.5 shrink-0">
                  <input type="checkbox" defaultChecked disabled className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Account & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Account &amp; Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Account role</p>
                <p className="text-xs text-gray-500 mt-0.5">NGO — create and manage projects</p>
              </div>
              <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-full">NGO</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Platform status</p>
                <p className="text-xs text-gray-500 mt-0.5">{statusInfo.desc}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="pt-2">
              <DeleteAccountButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
