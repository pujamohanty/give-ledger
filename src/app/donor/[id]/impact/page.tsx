import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart, Briefcase, Award, CheckCircle2, ExternalLink,
  Globe, Target, Users, Linkedin,
} from "lucide-react";

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "General Recognition",
  FINANCIAL: "Financial Impact",
  SKILL: "Skill Contribution",
  COMMUNITY_IMPACT: "Community Impact",
};

export default async function PublicDonorImpactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      donations: {
        include: {
          project: {
            include: {
              ngo: { select: { id: true, orgName: true } },
              milestones: {
                include: { outputMarkers: true },
                where: { status: "COMPLETED" },
              },
            },
          },
          blockchainRecord: { select: { txHash: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      skillContributions: {
        where: { status: "APPROVED" },
        include: { ngo: { select: { orgName: true } } },
        orderBy: { approvedAt: "desc" },
      },
      endorsementsReceived: {
        include: {
          ngo: { select: { orgName: true } },
          endorser: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      campaignsCreated: {
        include: { project: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) notFound();

  // Aggregate stats
  const totalDonated = user.donations.reduce((sum, d) => sum + d.amount, 0);
  const uniqueProjects = new Set(user.donations.map((d) => d.projectId)).size;
  const uniqueNgos = new Set(user.donations.map((d) => d.project.ngo.id)).size;
  const approvedSkills = user.skillContributions.length;
  const skillValue = user.skillContributions.reduce((sum, s) => sum + (s.monetaryValue ?? 0), 0);
  const campaignRaised = user.campaignsCreated.reduce((sum, c) => sum + c.raisedAmount, 0);

  // Find "founding donor" projects (first donor)
  const firstDonationsByProject = new Map<string, { userId: string; createdAt: Date }>();
  for (const d of user.donations) {
    const firstDonorsForProject = await prisma.donation.findFirst({
      where: { projectId: d.projectId },
      orderBy: { createdAt: "asc" },
      select: { userId: true, createdAt: true },
    });
    if (firstDonorsForProject) {
      firstDonationsByProject.set(d.projectId, firstDonorsForProject);
    }
  }
  const foundingProjects = user.donations
    .filter((d) => firstDonationsByProject.get(d.projectId)?.userId === id)
    .map((d) => ({ id: d.projectId, title: d.project.title ?? d.project.ngo.orgName }));
  const uniqueFoundingProjects = Array.from(
    new Map(foundingProjects.map((p) => [p.id, p])).values()
  );

  // Collect completed milestones with output markers
  const completedMilestones: { projectTitle: string; ngoName: string; name: string; metrics: string[] }[] = [];
  const seenMilestoneIds = new Set<string>();
  for (const d of user.donations) {
    for (const m of d.project.milestones) {
      if (seenMilestoneIds.has(m.id)) continue;
      seenMilestoneIds.add(m.id);
      const metrics = m.outputMarkers.map(
        (om) => `${om.value}${om.unit ? " " + om.unit : ""} ${om.label}`
      );
      completedMilestones.push({
        projectTitle: d.project.title,
        ngoName: d.project.ngo.orgName,
        name: m.name,
        metrics,
      });
    }
  }

  const memberSince = new Date(user.createdAt).getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "Donor"}
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-700">
                {(user.name ?? "D").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name ?? "Anonymous Donor"}</h1>
              <p className="text-sm text-gray-500 mt-1">GiveLedger member since {memberSince}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {uniqueFoundingProjects.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                    ⭐ Founding Donor
                  </Badge>
                )}
                {user.endorsementsReceived.length > 0 && (
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Endorsed by NGOs
                  </Badge>
                )}
                {approvedSkills > 0 && (
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    <Briefcase className="w-3 h-3 mr-1" />
                    Skill Contributor
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Donated", value: formatCurrency(totalDonated) },
            { label: "Projects Funded", value: String(uniqueProjects) },
            { label: "NGOs Supported", value: String(uniqueNgos) },
            { label: "Campaigns Created", value: String(user.campaignsCreated.length) },
          ].map((s) => (
            <Card key={s.label} className="text-center">
              <CardContent className="pt-5 pb-4">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Founding Donor recognition */}
        {uniqueFoundingProjects.length > 0 && (
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="p-5">
              <h2 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                ⭐ Founding Donor
              </h2>
              <p className="text-sm text-amber-800 mb-3">
                {user.name ?? "This donor"} was the <strong>first donor</strong> to these projects, making them possible:
              </p>
              <div className="space-y-1">
                {uniqueFoundingProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center gap-2 text-sm text-amber-700 hover:underline"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {p.title}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign mobilisation */}
        {(user.campaignsCreated.length > 0 || campaignRaised > 0) && (
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Network Mobilisation
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                {user.name ?? "This donor"} created {user.campaignsCreated.length} fundraising campaign{user.campaignsCreated.length !== 1 ? "s" : ""}{" "}
                {campaignRaised > 0 && `and mobilised ${formatCurrency(campaignRaised)} from their network`}.
              </p>
              <div className="space-y-1.5">
                {user.campaignsCreated.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm text-gray-700 p-2 bg-gray-50 rounded-lg">
                    <span>{c.title}</span>
                    <span className="text-xs text-emerald-700 font-medium">
                      {formatCurrency(c.raisedAmount)} raised
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verified Impact */}
        {completedMilestones.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                Verified Impact
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Milestones completed in projects funded by this donor — all verified on-chain before funds were released.
              </p>
              <div className="space-y-3">
                {completedMilestones.slice(0, 6).map((m, i) => (
                  <div key={i} className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-emerald-700 font-medium mb-0.5">{m.ngoName}</p>
                    <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                    {m.metrics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {m.metrics.map((metric, j) => (
                          <span key={j} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            {metric}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skill contributions */}
        {approvedSkills > 0 && (
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Skill &amp; Time Contributions
              </h2>
              {skillValue > 0 && (
                <p className="text-xs text-gray-500 mb-3">
                  {approvedSkills} verified contribution{approvedSkills !== 1 ? "s" : ""} —
                  valued at {formatCurrency(skillValue)} by NGOs
                </p>
              )}
              <div className="space-y-2">
                {user.skillContributions.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.ngo.orgName}</p>
                      <p className="text-xs text-gray-500">{c.skillCategory}</p>
                    </div>
                    <div className="text-right">
                      {c.monetaryValue && (
                        <p className="text-xs text-purple-700 font-semibold">
                          ${c.monetaryValue.toLocaleString()}
                        </p>
                      )}
                      {c.txHash && (
                        <a
                          href={`https://polygonscan.com/tx/${c.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          On-chain
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Endorsements */}
        {user.endorsementsReceived.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                NGO Endorsements
              </h2>
              <div className="space-y-3">
                {user.endorsementsReceived.map((e) => (
                  <div key={e.id} className="p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-800">
                        {e.ngo.orgName} — {CATEGORY_LABELS[e.category] ?? e.category}
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share this profile */}
        <div className="bg-emerald-50 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
          <Globe className="w-8 h-8 text-emerald-600 shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold text-emerald-900">Share this impact profile</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Every data point is verified on-chain. Share your profile as proof of real-world impact.
            </p>
          </div>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/donor/${id}/impact`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-[#0A66C2] text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90"
          >
            <Linkedin className="w-4 h-4" />
            Share on LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
