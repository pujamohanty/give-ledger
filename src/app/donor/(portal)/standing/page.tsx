import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Heart, CheckCircle2, Briefcase } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "General Recognition",
  FINANCIAL: "Financial Impact",
  SKILL: "Skill Contribution",
  COMMUNITY_IMPACT: "Community Impact",
};

export default async function DonorStandingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Get all NGOs the donor has interacted with
  const [donations, skillContributions, endorsements] = await Promise.all([
    prisma.donation.findMany({
      where: { userId },
      include: { project: { include: { ngo: { select: { id: true, orgName: true } } } } },
    }),
    prisma.skillContribution.findMany({
      where: { donorId: userId },
      include: { ngo: { select: { id: true, orgName: true } } },
    }),
    prisma.donorEndorsement.findMany({
      where: { donorId: userId },
      include: {
        ngo: { select: { id: true, orgName: true } },
        endorser: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Build per-NGO summary
  const ngoMap = new Map<
    string,
    {
      id: string;
      name: string;
      totalDonated: number;
      donationCount: number;
      approvedSkills: number;
      endorsements: typeof endorsements;
    }
  >();

  for (const d of donations) {
    const ngo = d.project.ngo;
    const existing = ngoMap.get(ngo.id);
    if (existing) {
      existing.totalDonated += d.amount;
      existing.donationCount += 1;
    } else {
      ngoMap.set(ngo.id, {
        id: ngo.id,
        name: ngo.orgName,
        totalDonated: d.amount,
        donationCount: 1,
        approvedSkills: 0,
        endorsements: [],
      });
    }
  }

  for (const sc of skillContributions) {
    if (sc.status !== "APPROVED") continue;
    const existing = ngoMap.get(sc.ngo.id);
    if (existing) {
      existing.approvedSkills += 1;
    } else {
      ngoMap.set(sc.ngo.id, {
        id: sc.ngo.id,
        name: sc.ngo.orgName,
        totalDonated: 0,
        donationCount: 0,
        approvedSkills: 1,
        endorsements: [],
      });
    }
  }

  for (const e of endorsements) {
    const existing = ngoMap.get(e.ngo.id);
    if (existing) {
      existing.endorsements.push(e);
    }
  }

  const ngoList = Array.from(ngoMap.values()).sort((a, b) => b.totalDonated - a.totalDonated);
  const totalEndorsements = endorsements.length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My NGO Standing</h1>
        <p className="text-gray-500 text-sm mt-1">
          Your recognition and standing within each NGO you&apos;ve supported.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "NGOs Supported", value: ngoList.length.toString() },
          { label: "Endorsements Received", value: totalEndorsements.toString() },
          { label: "Approved Skill Contributions", value: skillContributions.filter((c) => c.status === "APPROVED").length.toString() },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {ngoList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No NGO relationships yet.</p>
            <p className="text-xs text-gray-400 mt-1">Donate or contribute skills to start building your NGO standing.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ngoList.map((ngo) => (
            <Card key={ngo.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-700">
                        {ngo.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{ngo.name}</CardTitle>
                      <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                        {ngo.totalDonated > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-rose-400" />
                            ${ngo.totalDonated.toLocaleString()} donated
                          </span>
                        )}
                        {ngo.approvedSkills > 0 && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-emerald-500" />
                            {ngo.approvedSkills} skill{ngo.approvedSkills !== 1 ? "s" : ""} approved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {ngo.endorsements.length > 0 ? (
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                      <Award className="w-3 h-3 mr-1" />
                      {ngo.endorsements.length} Endorsement{ngo.endorsements.length !== 1 ? "s" : ""}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-500 text-xs">No endorsements yet</Badge>
                  )}
                </div>
              </CardHeader>
              {ngo.endorsements.length > 0 && (
                <CardContent className="pt-0 space-y-3">
                  {ngo.endorsements.map((e) => (
                    <div key={e.id} className="p-3 bg-emerald-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-800">
                          {CATEGORY_LABELS[e.category] ?? e.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          by {e.endorser.name ?? "NGO Staff"}
                        </span>
                      </div>
                      {e.note && (
                        <p className="text-xs text-emerald-700 italic pl-5">
                          &quot;{e.note}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
