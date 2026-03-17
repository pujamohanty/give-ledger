import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Users, Clock, ExternalLink, CheckCircle2, Target,
} from "lucide-react";
import ShareMilestoneCard from "@/components/ShareMilestoneCard";
import ShareCampaignButton from "./ShareCampaignButton";
import IStartedThisCard from "./IStartedThisCard";

const categoryLabel: Record<string, string> = {
  INCOME_GENERATION: "Income Generation",
  CHILD_CARE: "Child Care",
  ELDERLY_CARE: "Elderly Care",
  PHYSICALLY_DISABLED: "Accessibility",
  PET_CARE: "Animal Welfare",
  OTHER: "Other",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true } },
      project: {
        include: {
          ngo: { select: { id: true, orgName: true } },
          milestones: {
            where: { status: "COMPLETED" },
            include: {
              outputMarkers: true,
              disbursement: { include: { blockchainRecord: true } },
            },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      contributors: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!campaign) notFound();

  const pct = campaign.goalAmount > 0
    ? Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100))
    : 0;

  const isCreator = session?.user?.id === campaign.creatorId;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://give-ledger.vercel.app";

  // Build "I Started This" share text for completed campaigns
  const iStartedThisPost = isCreator
    ? [
        `I started a fundraising campaign for "${campaign.project.title}" by ${campaign.project.ngo.orgName}.`,
        ``,
        `The result: $${campaign.raisedAmount.toLocaleString()} raised — that's ${campaign.contributors.length} people I mobilised to give.`,
        ``,
        `Every contribution went to a milestone-locked fund. The NGO couldn't access the money until they delivered and it was verified on-chain.`,
        ...(campaign.project.milestones.length > 0
          ? [
              ``,
              `Milestones completed:`,
              ...campaign.project.milestones.map((m) => {
                const metric = m.outputMarkers[0];
                return `✅ "${m.name}"${metric ? ` — ${metric.value}${metric.unit ? " " + metric.unit : ""} ${metric.label}` : ""}`;
              }),
            ]
          : []),
        ``,
        `This is what it means to mobilise your network for verified impact.`,
        ``,
        `Campaign record: ${appUrl}/campaigns/${id}`,
        ``,
        `#GiveLedger #IStartedThis #Philanthropy #VerifiedImpact`,
      ].join("\n")
    : null;

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> All Campaigns
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign header */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {categoryLabel[campaign.project.category] ?? campaign.project.category}
                  </span>
                  <span className="text-xs text-gray-400">Donor Campaign</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{campaign.title}</h1>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {(campaign.creator.name ?? "A").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Campaign by{" "}
                      <Link href={`/donor/${campaign.creator.id}/profile`} className="hover:underline text-emerald-700">
                        {campaign.creator.name ?? "Anonymous"}
                      </Link>
                    </p>
                    <p className="text-xs text-gray-500">
                      For:{" "}
                      <Link href={`/ngo/${campaign.project.ngo.id}`} className="hover:underline text-gray-700">
                        {campaign.project.ngo.orgName}
                      </Link>
                      {" · "}
                      <Link href={`/projects/${campaign.projectId}`} className="hover:underline text-gray-700">
                        {campaign.project.title}
                      </Link>
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-gray-900 text-lg">
                      ${campaign.raisedAmount.toLocaleString()}
                    </span>
                    <span className="text-gray-400">
                      of ${campaign.goalAmount.toLocaleString()} · {pct}%
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>

                <div className="flex items-center gap-5 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {campaign.contributors.length} contributors
                  </span>
                  {campaign.endsAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {Math.max(
                        0,
                        Math.floor(
                          (new Date(campaign.endsAt).getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )}{" "}
                      days left
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Campaign description */}
            {campaign.description && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="font-bold text-gray-900 mb-4">
                    Why{" "}
                    <Link href={`/donor/${campaign.creator.id}/profile`} className="hover:underline text-emerald-700">
                      {campaign.creator.name ?? "this donor"}
                    </Link>
                    {" "}is running this
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {campaign.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* "I Started This" card — visible to campaign creator only */}
            {isCreator && iStartedThisPost && (
              <IStartedThisCard
                postText={iStartedThisPost}
                raisedAmount={campaign.raisedAmount}
                contributorCount={campaign.contributors.length}
                campaignId={id}
                appUrl={appUrl}
              />
            )}

            {/* Verified milestones on this project */}
            {campaign.project.milestones.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="font-bold text-gray-900 mb-4">What&apos;s Already Been Achieved</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    These milestones are verified on-chain. Your contribution funds the next ones.
                  </p>
                  <div className="space-y-4">
                    {campaign.project.milestones.map((m) => {
                      const txHash =
                        m.disbursement?.blockchainRecord?.txHash ?? m.disbursement?.txHash ?? null;
                      const metric = m.outputMarkers[0]
                        ? `${m.outputMarkers[0].value}${m.outputMarkers[0].unit ? " " + m.outputMarkers[0].unit : ""} ${m.outputMarkers[0].label}`
                        : null;
                      return (
                        <div
                          key={m.id}
                          className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-emerald-900 text-sm">{m.name}</p>
                            {metric && (
                              <p className="text-sm text-emerald-700 mt-1">{metric}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              {txHash && (
                                <a
                                  href={`https://polygonscan.com/tx/${txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-emerald-600"
                                >
                                  {txHash.slice(0, 20)}... <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {metric && (
                                <ShareMilestoneCard
                                  milestoneId={m.id}
                                  milestoneName={m.name}
                                  projectTitle={campaign.project.title}
                                  ngoName={campaign.project.ngo.orgName}
                                  metric={metric}
                                  txHash={txHash ?? undefined}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent contributors */}
            {campaign.contributors.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Recent Contributors</h2>
                  <div className="space-y-3">
                    {campaign.contributors.map((c) => (
                      <div key={c.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">
                            {(c.user.name ?? "A").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link href={`/donor/${c.user.id}/profile`} className="text-sm font-medium text-gray-900 hover:underline">
                              {c.user.name ?? "Anonymous"}
                            </Link>
                            <p className="text-xs text-gray-400">{timeAgo(c.createdAt)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-emerald-700">
                          ${c.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-sm sticky top-24">
              <CardContent className="p-5">
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900">
                    ${campaign.raisedAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    raised of ${campaign.goalAmount.toLocaleString()} goal
                  </p>
                </div>
                <Progress value={pct} className="mb-4" />

                <Link href={`/projects/${campaign.projectId}`}>
                  <Button size="lg" className="w-full mb-3">
                    Contribute to This Campaign
                  </Button>
                </Link>
                <ShareCampaignButton campaignId={campaign.id} title={campaign.title} />

                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    Contributions go directly to the project — milestone-locked. 100% traceable on-chain.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
              <Target className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{campaign.project.title}</p>
                <Link
                  href={`/projects/${campaign.projectId}`}
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  View full project <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

