import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, calcFundingPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ShareMilestoneCard from "@/components/ShareMilestoneCard";
import ImpactSimulator from "@/components/ImpactSimulator";
import {
  DollarSign, FolderOpen, CheckCircle2, Users, ExternalLink,
  Circle, ArrowRight, Share2, Zap, Bell, TrendingUp, Activity,
  Star, Gift, Clock,
} from "lucide-react";

function MilestoneIcon({ status }: { status: string }) {
  if (status === "COMPLETED") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (status === "UNDER_REVIEW") return <Circle className="w-4 h-4 text-amber-500 fill-amber-100" />;
  return <Circle className="w-4 h-4 text-gray-300" />;
}

export default async function DonorDashboard({
  searchParams,
}: {
  searchParams: Promise<{ donated?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const justDonated = params?.donated === "true";
  const userId = session.user.id;

  // Fetch all donations with project and NGO info
  const donations = await prisma.donation.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          ngo: true,
          milestones: { orderBy: { orderIndex: "asc" } },
        },
      },
      blockchainRecord: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // KPI calculations
  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const uniqueProjectIds = [...new Set(donations.map((d) => d.projectId))];
  const projectCount = uniqueProjectIds.length;

  // Milestones for all projects this donor has funded
  const allMilestones = await prisma.milestone.findMany({
    where: { projectId: { in: uniqueProjectIds } },
    include: { outputMarkers: true, project: { include: { ngo: true } }, disbursement: true },
    orderBy: { completedAt: "desc" },
  });

  const completedMilestones = allMilestones.filter((m) => m.status === "COMPLETED");
  const milestonesUnlocked = completedMilestones.length;

  // Lives impacted — sum numeric output marker values
  let livesImpacted = 0;
  completedMilestones.forEach((m) => {
    m.outputMarkers.forEach((om) => {
      const num = parseFloat(om.value);
      if (!isNaN(num) && num > 0 && num < 100000) livesImpacted += num;
    });
  });

  // Notifications
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Activity feed
  const activityEvents = await prisma.activityEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Build impact timeline: merge completed milestones + donations, sorted by date
  type TimelineItem = {
    id: string;
    type: "MILESTONE_COMPLETE" | "MILESTONE_UNDER_REVIEW" | "DONATION";
    date: string;
    project: string;
    ngo: string;
    event: string;
    metric: string | null;
    txHash: string | null;
    milestoneId: string | null;
    shareable: boolean;
  };

  const timelineItems: TimelineItem[] = [];

  allMilestones.slice(0, 6).forEach((m) => {
    const metric = m.outputMarkers.length > 0
      ? `${m.outputMarkers[0].value} ${m.outputMarkers[0].unit ?? ""} ${m.outputMarkers[0].label}`.trim()
      : null;
    timelineItems.push({
      id: m.id,
      type: m.status === "COMPLETED" ? "MILESTONE_COMPLETE" : "MILESTONE_UNDER_REVIEW",
      date: m.completedAt ? formatDate(m.completedAt) : "In progress",
      project: m.project.title,
      ngo: m.project.ngo.orgName,
      event: m.name,
      metric,
      txHash: m.disbursement?.txHash ?? null,
      milestoneId: m.id,
      shareable: m.status === "COMPLETED" && !!metric,
    });
  });

  donations.slice(0, 4).forEach((d) => {
    timelineItems.push({
      id: `don-${d.id}`,
      type: "DONATION",
      date: formatDate(d.createdAt),
      project: d.project.title,
      ngo: d.project.ngo.orgName,
      event: `You donated ${formatCurrency(d.amount)}`,
      metric: null,
      txHash: d.txHash ?? null,
      milestoneId: null,
      shareable: false,
    });
  });

  timelineItems.sort((a, b) => {
    const da = new Date(a.date === "In progress" ? 0 : a.date).getTime();
    const db = new Date(b.date === "In progress" ? 0 : b.date).getTime();
    return db - da;
  });

  const kpis = [
    { label: "Total Donated", value: formatCurrency(totalDonated), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Projects Funded", value: String(projectCount), icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Milestones Unlocked", value: String(milestonesUnlocked), icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Lives Impacted", value: livesImpacted > 0 ? `~${livesImpacted.toLocaleString()}` : "—", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  // Unique projects with milestone data for the projects section
  const projectsWithData = uniqueProjectIds.slice(0, 4).map((pid) => {
    const d = donations.find((don) => don.projectId === pid)!;
    const donated = donations
      .filter((don) => don.projectId === pid)
      .reduce((sum, don) => sum + don.amount, 0);
    const milestones = allMilestones.filter((m) => m.projectId === pid);
    return {
      id: pid,
      title: d.project.title,
      ngo: d.project.ngo.orgName,
      donated,
      raised: d.project.raisedAmount,
      goal: d.project.goalAmount,
      txHash: donations.find((don) => don.projectId === pid && don.txHash)?.txHash ?? null,
      milestones: milestones.map((m) => ({
        name: m.name,
        status: m.status,
        date: m.targetDate ? formatDate(m.targetDate) : "—",
      })),
    };
  });

  return (
    <div className="p-6 lg:p-8">
      {justDonated && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Donation received — thank you!</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Your funds are held in escrow and will be released when the next milestone is verified and approved.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Impact Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Every donation tracked. Every milestone verified.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Link href="/donor/notifications">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="w-4 h-4" />
              </Button>
            </Link>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center pointer-events-none">
                {unreadCount}
              </span>
            )}
          </div>
          <Link href="/projects">
            <Button className="flex items-center gap-2">Donate Again <ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 ${kpi.bg} rounded-lg flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Link href="/campaigns/new" className="group">
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-colors">
            <Gift className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-semibold text-purple-900">Start a Campaign</p>
              <p className="text-xs text-purple-600">Fundraise for a project you love</p>
            </div>
          </div>
        </Link>
        <Link href="/projects" className="group">
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 hover:border-amber-300 transition-colors">
            <Star className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Cast Spotlight Vote</p>
              <p className="text-xs text-amber-600">Vote for a project to feature this month</p>
            </div>
          </div>
        </Link>
        <Link href="/donor/referral" className="group">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-colors">
            <Share2 className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Invite Friends</p>
              <p className="text-xs text-blue-600">Share GiveLedger with your network</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Impact Timeline */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Your Impact Timeline
            </h2>
            <Link href="/donor/impact">
              <Button variant="ghost" size="sm" className="text-emerald-700 gap-1">
                Full history <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {timelineItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No activity yet — make your first donation to start your impact timeline.</p>
              <Link href="/projects" className="mt-4 inline-block">
                <Button size="sm">Browse Projects</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {timelineItems.slice(0, 6).map((event, i) => (
                <div key={event.id} className="relative flex gap-4">
                  {i < Math.min(timelineItems.length, 6) - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    event.type === "MILESTONE_COMPLETE" ? "bg-emerald-100" :
                    event.type === "MILESTONE_UNDER_REVIEW" ? "bg-amber-100" : "bg-gray-100"
                  }`}>
                    {event.type === "MILESTONE_COMPLETE" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : event.type === "MILESTONE_UNDER_REVIEW" ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <DollarSign className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 mb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-400">{event.date}</span>
                          {event.type === "MILESTONE_COMPLETE" && (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Milestone Verified
                            </span>
                          )}
                          {event.type === "MILESTONE_UNDER_REVIEW" && (
                            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              Under Review
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 text-sm mt-1">{event.event}</p>
                        <p className="text-xs text-emerald-700 mt-0.5">{event.ngo} · {event.project}</p>
                        {event.metric && (
                          <p className="text-sm text-gray-600 mt-2 font-medium">{event.metric}</p>
                        )}
                        {event.txHash && (
                          <a
                            href={`https://polygonscan.com/tx/${event.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 mt-2"
                          >
                            <span className="font-mono">{event.txHash.slice(0, 18)}...</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {event.shareable && event.milestoneId && event.metric && (
                        <ShareMilestoneCard
                          milestoneId={event.milestoneId}
                          milestoneName={event.event}
                          projectTitle={event.project}
                          ngoName={event.ngo}
                          metric={event.metric}
                          txHash={event.txHash ?? undefined}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Activity Feed */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activityEvents.length === 0 ? (
                <div className="px-5 py-6 text-center text-gray-400 text-xs">No recent activity</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {activityEvents.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        item.type === "MILESTONE_COMPLETE" ? "bg-emerald-50" :
                        item.type === "PROJECT_LAUNCH" ? "bg-blue-50" : "bg-purple-50"
                      }`}>
                        {item.type === "MILESTONE_COMPLETE" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : item.type === "PROJECT_LAUNCH" ? (
                          <Zap className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Gift className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 leading-snug">{item.description}</p>
                        {item.projectTitle && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.projectTitle}</p>
                        )}
                        <p className="text-xs text-gray-300 mt-1">{formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Impact summary */}
          <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-5">
              <h3 className="font-semibold text-emerald-900 mb-3">Your Impact</h3>
              {completedMilestones.length === 0 ? (
                <p className="text-sm text-emerald-700">Complete your first donation to see your impact here.</p>
              ) : (
                <div className="space-y-2">
                  {completedMilestones.slice(0, 4).flatMap((m) =>
                    m.outputMarkers.slice(0, 1).map((om) => (
                      <div key={om.id} className="flex justify-between">
                        <span className="text-sm text-emerald-800">{om.label}</span>
                        <span className="font-bold text-emerald-900">{om.value} {om.unit ?? ""}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
              <div className="mt-4 pt-3 border-t border-emerald-200">
                <Link href="/impact">
                  <Button size="sm" variant="outline" className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-100">
                    See Platform Impact
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Projects You Fund */}
      {projectsWithData.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Projects You Fund</h2>
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="text-emerald-700 gap-1">
                Browse more <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            {projectsWithData.map((project) => {
              const pct = calcFundingPercent(project.raised, project.goal);
              const completed = project.milestones.filter((m) => m.status === "COMPLETED").length;
              return (
                <Card key={project.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{project.title}</h3>
                        <p className="text-xs text-emerald-700">{project.ngo}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        You donated {formatCurrency(project.donated)}
                      </span>
                    </div>
                    <div className="mt-3 mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Overall funding</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} />
                    </div>
                    <div className="space-y-2 mt-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Milestones ({completed}/{project.milestones.length})
                      </p>
                      {project.milestones.map((m) => (
                        <div key={m.name} className="flex items-center gap-2">
                          <MilestoneIcon status={m.status} />
                          <span className={`text-xs flex-1 ${
                            m.status === "COMPLETED" ? "text-gray-600 line-through" :
                            m.status === "UNDER_REVIEW" ? "text-amber-700 font-medium" : "text-gray-400"
                          }`}>{m.name}</span>
                          <span className="text-xs text-gray-400">{m.date}</span>
                        </div>
                      ))}
                    </div>
                    {project.txHash && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <a
                          href={`https://polygonscan.com/tx/${project.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-emerald-700 hover:underline"
                        >
                          <span className="font-mono">{project.txHash.slice(0, 18)}...</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <Link href={`/campaigns/new?project=${project.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Gift className="w-3 h-3" />
                            Start Campaign
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <ImpactSimulator />
    </div>
  );
}
