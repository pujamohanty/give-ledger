import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  FolderOpen,
  Clock,
  Users,
  ExternalLink,
  CheckCircle2,
  Circle,
  ArrowRight,
  Share2,
  Zap,
  Bell,
  TrendingUp,
  Activity,
  Star,
  Gift,
} from "lucide-react";
import ShareMilestoneCard from "@/components/ShareMilestoneCard";
import ImpactSimulator from "@/components/ImpactSimulator";

const kpis = [
  { label: "Total Donated", value: "$1,250", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Projects Funded", value: "4", icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Milestones Unlocked", value: "5", icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Lives Impacted", value: "~340", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
];

// Timeline of all events across projects this donor is involved in
const impactTimeline = [
  {
    id: "t1",
    type: "MILESTONE_COMPLETE",
    date: "Feb 3, 2026",
    project: "Clean Water for Kibera Schools",
    ngo: "WaterBridge Kenya",
    event: "Installation — Schools 1–6",
    metric: "2,400 children now have access to clean water",
    txHash: "0x7d6e5f4c...",
    milestoneId: "m1",
    shareable: true,
  },
  {
    id: "t2",
    type: "DONATION",
    date: "Mar 1, 2026",
    project: "Clean Water for Kibera Schools",
    ngo: "WaterBridge Kenya",
    event: "You donated $150",
    metric: null,
    txHash: "0x4a3b2c1d...",
    milestoneId: null,
    shareable: false,
  },
  {
    id: "t3",
    type: "MILESTONE_COMPLETE",
    date: "Jan 28, 2026",
    project: "Livelihood Training - Rural Bihar",
    ngo: "Pragati Foundation",
    event: "Cohort 1 — 45 Women Trained & Certified",
    metric: "45 women certified, 7 businesses already started",
    txHash: "0x9a8b7c6d...",
    milestoneId: "m2",
    shareable: true,
  },
  {
    id: "t4",
    type: "DONATION",
    date: "Feb 14, 2026",
    project: "Livelihood Training - Rural Bihar",
    ngo: "Pragati Foundation",
    event: "You donated $500",
    metric: null,
    txHash: "0x8f7e6d5c...",
    milestoneId: null,
    shareable: false,
  },
  {
    id: "t5",
    type: "MILESTONE_UNDER_REVIEW",
    date: "Mar 20, 2026 (expected)",
    project: "Clean Water for Kibera Schools",
    ngo: "WaterBridge Kenya",
    event: "Installation — Schools 7–12",
    metric: "Evidence under admin review",
    txHash: null,
    milestoneId: null,
    shareable: false,
  },
];

const myProjects = [
  {
    id: "1",
    title: "Clean Water for Kibera Schools",
    ngo: "WaterBridge Kenya",
    donated: 150,
    raised: 18400,
    goal: 25000,
    milestones: [
      { name: "Equipment procurement", status: "COMPLETED", date: "Jan 15" },
      { name: "Installation Phase 1", status: "COMPLETED", date: "Feb 3" },
      { name: "Installation Phase 2", status: "UNDER_REVIEW", date: "Mar 20" },
      { name: "Community training", status: "PENDING", date: "Apr 10" },
    ],
    txHash: "0x4a3b2c1d...",
  },
  {
    id: "2",
    title: "Livelihood Training - Rural Bihar",
    ngo: "Pragati Foundation",
    donated: 500,
    raised: 31200,
    goal: 40000,
    milestones: [
      { name: "Training centre setup", status: "COMPLETED", date: "Dec 10" },
      { name: "Cohort 1 training", status: "COMPLETED", date: "Jan 28" },
      { name: "Cohort 2 training", status: "PENDING", date: "Mar 15" },
    ],
    txHash: "0x8f7e6d5c...",
  },
];

// Platform activity feed
const activityFeed = [
  {
    id: "a1",
    type: "MILESTONE_COMPLETE",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    text: "SilverYears Trust completed milestone: Foundation & ground floor structure",
    sub: "Elderly Care Home - Mysore",
    time: "2h ago",
  },
  {
    id: "a2",
    type: "PROJECT_LAUNCH",
    icon: Zap,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    text: "New project launched: Wheelchair Ramps - Govandi",
    sub: "AccessAbility India · Goal: $15,000",
    time: "1d ago",
  },
  {
    id: "a3",
    type: "CAMPAIGN",
    icon: Gift,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
    text: "Sarah K. started a fundraising campaign for Kibera Water",
    sub: "\"Help fund the final school installations\" · $3,200 raised",
    time: "2d ago",
  },
  {
    id: "a4",
    type: "MILESTONE_COMPLETE",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    text: "Pragati Foundation completed: Training centre setup",
    sub: "Livelihood Training - Rural Bihar · 45 women trained",
    time: "3d ago",
  },
  {
    id: "a5",
    type: "SPOTLIGHT",
    icon: Star,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    text: "Monthly spotlight: Clean Water for Kibera Schools is this month's most-voted project",
    sub: "Cast your vote for next month →",
    time: "5d ago",
  },
];

const notifications = [
  { text: "Milestone verified on Kibera Water project", time: "2h ago", read: false },
  { text: "Your campaign raised $200 this week", time: "1d ago", read: false },
  { text: "New project by WaterBridge Kenya — check it out", time: "3d ago", read: true },
];
const unreadCount = notifications.filter((n) => !n.read).length;

function MilestoneIcon({ status }: { status: string }) {
  if (status === "COMPLETED") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (status === "UNDER_REVIEW") return <Circle className="w-4 h-4 text-amber-500 fill-amber-100" />;
  return <Circle className="w-4 h-4 text-gray-300" />;
}

export default function DonorDashboard() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
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

      {/* Quick action banner */}
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
        {/* Impact Timeline — Feature 2 */}
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

          <div className="space-y-3">
            {impactTimeline.map((event, i) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Timeline line */}
                {i < impactTimeline.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" />
                )}

                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                  event.type === "MILESTONE_COMPLETE" ? "bg-emerald-100" :
                  event.type === "MILESTONE_UNDER_REVIEW" ? "bg-amber-100" :
                  "bg-gray-100"
                }`}>
                  {event.type === "MILESTONE_COMPLETE" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : event.type === "MILESTONE_UNDER_REVIEW" ? (
                    <Clock className="w-5 h-5 text-amber-600" />
                  ) : (
                    <DollarSign className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                {/* Content */}
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
                          <span className="font-mono">{event.txHash}</span>
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
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Activity Feed — Feature 8 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {activityFeed.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                    <div className={`w-8 h-8 ${item.iconBg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 leading-snug">{item.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                      <p className="text-xs text-gray-300 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Impact summary */}
          <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-5">
              <h3 className="font-semibold text-emerald-900 mb-3">Your Impact</h3>
              <div className="space-y-2">
                {[
                  { label: "Students with clean water", value: "2,400" },
                  { label: "Women trained & certified", value: "45" },
                  { label: "Elderly residents in care", value: "8" },
                ].map((impact) => (
                  <div key={impact.label} className="flex justify-between">
                    <span className="text-sm text-emerald-800">{impact.label}</span>
                    <span className="font-bold text-emerald-900">{impact.value}</span>
                  </div>
                ))}
              </div>
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

      {/* Projects section */}
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
          {myProjects.map((project) => {
            const pct = Math.round((project.raised / project.goal) * 100);
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
                      You donated ${project.donated}
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

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <a
                      href={`https://polygonscan.com/tx/${project.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-emerald-700 hover:underline"
                    >
                      <span className="font-mono">{project.txHash}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <Link href={`/campaigns/new?project=${project.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <Gift className="w-3 h-3" />
                        Start Campaign
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Impact Simulator — Feature 9 */}
      <ImpactSimulator />
    </div>
  );
}
