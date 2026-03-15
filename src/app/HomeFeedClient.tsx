"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Heart, CheckCircle2, Rocket, Star, Briefcase, Users,
  Loader2, TrendingUp, Landmark, BookOpen, Globe,
  ChevronRight, ArrowRight, Share2, PartyPopper,
  LayoutDashboard, HandCoins, BadgeCheck, Leaf,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

/* ─── Types ─────────────────────────────────────────────────── */
type ActivityEvent = {
  id: string;
  type: string;
  projectId: string | null;
  ngoName: string | null;
  projectTitle: string | null;
  actorName: string | null;
  actorId: string | null;
  actorType: string | null;
  description: string;
  linkUrl: string | null;
  createdAt: string;
};

type FeaturedProject = {
  id: string;
  title: string;
  category: string;
  goalAmount: number;
  raisedAmount: number;
  ngo: { orgName: string };
};

type RecentNgo = {
  id: string;
  orgName: string;
  description: string | null;
};

type Props = {
  initial: ActivityEvent[];
  initialCursor: string | null;
  stats: { donors: number; ngos: number; projects: number; milestones: number };
  featuredProjects: FeaturedProject[];
  recentNgos: RecentNgo[];
  session: { name?: string | null; image?: string | null; role?: string } | null;
};

/* ─── Config ─────────────────────────────────────────────────── */
const EVENT_CONFIG: Record<string, {
  icon: React.ElementType;
  bg: string;
  color: string;
  border: string;
  badge: string;
  label: string;
  verb: string;
}> = {
  DONATION: {
    icon: Heart, bg: "bg-rose-100", color: "text-rose-600",
    border: "border-l-rose-400", badge: "bg-rose-100 text-rose-700",
    label: "Donation", verb: "made a donation",
  },
  MILESTONE_COMPLETE: {
    icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-600",
    border: "border-l-emerald-400", badge: "bg-emerald-100 text-emerald-700",
    label: "Milestone", verb: "completed a milestone",
  },
  PROJECT_LAUNCH: {
    icon: Rocket, bg: "bg-blue-100", color: "text-blue-600",
    border: "border-l-blue-400", badge: "bg-blue-100 text-blue-700",
    label: "New Project", verb: "launched a project",
  },
  SKILL_APPROVED: {
    icon: Briefcase, bg: "bg-violet-100", color: "text-violet-600",
    border: "border-l-violet-400", badge: "bg-violet-100 text-violet-700",
    label: "Skill", verb: "had a skill verified",
  },
  NGO_JOINED: {
    icon: Users, bg: "bg-amber-100", color: "text-amber-600",
    border: "border-l-amber-400", badge: "bg-amber-100 text-amber-700",
    label: "NGO Joined", verb: "joined GiveLedger",
  },
  DONOR_ENDORSEMENT: {
    icon: Star, bg: "bg-yellow-100", color: "text-yellow-600",
    border: "border-l-yellow-400", badge: "bg-yellow-100 text-yellow-700",
    label: "Endorsement", verb: "received an endorsement",
  },
};

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "DONATION", label: "Donations" },
  { key: "MILESTONE_COMPLETE", label: "Milestones" },
  { key: "PROJECT_LAUNCH", label: "Projects" },
  { key: "NGO_JOINED", label: "NGOs" },
  { key: "SKILL_APPROVED", label: "Skills" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  CHILD_CARE: "🧒", INCOME_GENERATION: "💼", ELDERLY_CARE: "🏡",
  PHYSICALLY_DISABLED: "♿", PET_CARE: "🐾", OTHER: "🌱",
};

/* ─── Helpers ────────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-rose-500", "bg-blue-500", "bg-violet-500", "bg-amber-500",
  "bg-emerald-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
];

function avatarColor(name: string | null | undefined): string {
  if (!name) return "bg-gray-400";
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function roleLabel(type: string | null | undefined): string {
  if (type === "NGO") return "NGO";
  if (type === "ADMIN") return "Admin";
  return "Donor";
}

/* ─── EventCard ──────────────────────────────────────────────── */
function EventCard({ event }: { event: ActivityEvent }) {
  const cfg = EVENT_CONFIG[event.type] ?? {
    icon: Star, bg: "bg-gray-100", color: "text-gray-600",
    border: "border-l-gray-300", badge: "bg-gray-100 text-gray-700",
    label: event.type, verb: "did something",
  };
  const Icon = cfg.icon;
  const [liked, setLiked] = useState(false);
  const [likeCount] = useState(() => Math.floor(Math.random() * 18) + 1);
  const [celebrated, setCelebrated] = useState(false);

  return (
    <article className={`bg-white rounded-lg border border-[rgba(0,0,0,0.08)] border-l-4 ${cfg.border} shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.07)] transition-all duration-150`}>
      {/* Card Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-full ${avatarColor(event.actorName)} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
              {initials(event.actorName)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm leading-tight">
                  {event.actorName ?? "Someone"}
                </span>
                <span className="text-xs text-gray-400 font-normal">
                  · {roleLabel(event.actorType)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </span>
                <span className="text-xs text-gray-400">{timeAgo(event.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post body */}
        <p className="text-sm text-gray-800 mt-3 leading-relaxed">{event.description}</p>

        {/* Contextual sub-card */}
        {(event.ngoName || event.projectTitle) && (
          <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
            </div>
            <div className="min-w-0">
              {event.projectTitle && (
                <p className="text-xs font-semibold text-gray-800 truncate">{event.projectTitle}</p>
              )}
              {event.ngoName && (
                <p className="text-xs text-gray-500 truncate">{event.ngoName}</p>
              )}
            </div>
            {event.linkUrl && (
              <Link href={event.linkUrl} className={`ml-auto text-xs font-medium ${cfg.color} hover:underline shrink-0`}>
                View →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Engagement Bar */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-1">
        <button
          onClick={() => setLiked(l => !l)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${liked ? "bg-rose-50 text-rose-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
          <span>{liked ? likeCount + 1 : likeCount}</span>
        </button>
        <button
          onClick={() => setCelebrated(c => !c)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${celebrated ? "bg-amber-50 text-amber-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
        >
          <PartyPopper className="w-3.5 h-3.5" />
          <span>Celebrate</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors ml-auto">
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}

/* ─── Left Sidebar ───────────────────────────────────────────── */
function LeftSidebar({ session, stats }: {
  session: Props["session"];
  stats: Props["stats"];
}) {
  const roleRoute = session?.role === "NGO" ? "/ngo" : session?.role === "ADMIN" ? "/admin" : "/donor";

  return (
    <aside className="space-y-4">
      {/* Profile / Auth Card */}
      {session ? (
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
          <div className="h-14 bg-gradient-to-r from-emerald-600 to-teal-500" />
          <div className="px-4 pb-4 -mt-6">
            <div className={`w-14 h-14 rounded-full border-4 border-white ${avatarColor(session.name)} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
              {initials(session.name)}
            </div>
            <p className="font-bold text-gray-900 mt-2 text-sm">{session.name}</p>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
              <BadgeCheck className="w-3 h-3" /> {session.role ?? "Donor"}
            </span>
            <div className="mt-3 space-y-1">
              <Link href={`${roleRoute}/dashboard`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1.5 rounded-lg transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              {session.role !== "NGO" && (
                <Link href="/donor/donations" className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1.5 rounded-lg transition-colors">
                  <HandCoins className="w-4 h-4" /> My Donations
                </Link>
              )}
              <Link href="/projects" className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1.5 rounded-lg transition-colors">
                <BookOpen className="w-4 h-4" /> Browse Projects
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">GiveLedger</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Every donation, tracked on-chain. Join donors who know exactly where their money goes.
          </p>
          <div className="space-y-2">
            <Link href="/login" className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-emerald-700 transition-colors">
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/signup" className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Platform Stats */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Platform Impact</h3>
        <div className="space-y-3">
          {[
            { icon: Users, label: "Active Donors", value: stats.donors.toLocaleString(), color: "text-rose-500" },
            { icon: Landmark, label: "Verified NGOs", value: stats.ngos.toLocaleString(), color: "text-amber-500" },
            { icon: BookOpen, label: "Projects", value: stats.projects.toLocaleString(), color: "text-blue-500" },
            { icon: CheckCircle2, label: "Milestones Proven", value: stats.milestones.toLocaleString(), color: "text-emerald-500" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-gray-600">{label}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] p-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Explore</h3>
        <div className="space-y-1">
          {[
            { href: "/projects", label: "Browse Projects", icon: BookOpen },
            { href: "/impact", label: "Platform Impact", icon: TrendingUp },
            { href: "/suggest-ngo", label: "Suggest an NGO", icon: Globe },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1.5 rounded-lg transition-colors">
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ─── Right Sidebar ──────────────────────────────────────────── */
function RightSidebar({ featuredProjects, recentNgos }: {
  featuredProjects: FeaturedProject[];
  recentNgos: RecentNgo[];
}) {
  return (
    <aside className="space-y-4">
      {/* Featured Projects */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top Projects</h3>
          <Link href="/projects" className="text-xs text-emerald-600 font-semibold hover:underline">See all</Link>
        </div>
        <div className="space-y-4">
          {featuredProjects.map(project => {
            const pct = project.goalAmount > 0 ? Math.min(100, Math.round((project.raisedAmount / project.goalAmount) * 100)) : 0;
            const emoji = CATEGORY_EMOJI[project.category] ?? "🌱";
            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-lg shrink-0 group-hover:bg-emerald-100 transition-colors">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                      {project.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{project.ngo.orgName}</p>
                    <div className="mt-1.5">
                      <Progress value={pct} className="h-1.5" />
                      <p className="text-xs text-gray-500 mt-1">${project.raisedAmount.toLocaleString()} raised · {pct}%</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recently Joined NGOs */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">New NGOs</h3>
        </div>
        <div className="space-y-3">
          {recentNgos.map(ngo => (
            <Link key={ngo.id} href={`/ngo/${ngo.id}`} className="flex items-center gap-2.5 group">
              <div className={`w-9 h-9 rounded-full ${avatarColor(ngo.orgName)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {initials(ngo.orgName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">{ngo.orgName}</p>
                {ngo.description && (
                  <p className="text-xs text-gray-400 truncate">{ngo.description.slice(0, 50)}{ngo.description.length > 50 ? "…" : ""}</p>
                )}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0 group-hover:text-emerald-600 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Trust badge */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-emerald-700 rounded-md flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm text-gray-900">Are you a nonprofit?</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mb-3">
          Register your 501(c)(3) to raise funds with full milestone tracking and on-chain proof.
        </p>
        <Link href="/signup?role=ngo" className="inline-flex items-center gap-1 border border-emerald-700 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-emerald-50 transition-colors">
          Register your NGO <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  );
}

/* ─── Main Feed ──────────────────────────────────────────────── */
function Feed({ initial, initialCursor }: { initial: ActivityEvent[]; initialCursor: string | null }) {
  const [events, setEvents] = useState<ActivityEvent[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wall?cursor=${cursor}`);
      const data = await res.json();
      setEvents(prev => [...prev, ...data.items.map((e: ActivityEvent & { createdAt: string | Date }) => ({
        ...e,
        createdAt: typeof e.createdAt === "string" ? e.createdAt : new Date(e.createdAt).toISOString(),
      }))]);
      setCursor(data.nextCursor);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [cursor, loading]);

  const filtered = filter === "ALL" ? events : events.filter(e => e.type === filter);

  return (
    <div>
      {/* Filter tabs */}
      <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] p-1.5 mb-4 flex gap-1 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f.key ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] p-10 text-center text-gray-400 text-sm">
            No activity for this filter yet.
          </div>
        )}
        {filtered.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Load more */}
      {cursor && filter === "ALL" && (
        <div className="text-center mt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm text-emerald-700 font-semibold border border-emerald-600 bg-white rounded-full px-6 py-2 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Loading…" : "Load more activity"}
          </button>
        </div>
      )}

      {!cursor && events.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-4 py-2">
          You&apos;re all caught up · {events.length} events
        </p>
      )}
    </div>
  );
}

/* ─── Root export ────────────────────────────────────────────── */
export default function HomeFeedClient({ initial, initialCursor, stats, featuredProjects, recentNgos, session }: Props) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Top banner for guests */}
      {!session && (
        <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">Welcome to GiveLedger</p>
            <p className="text-sm text-gray-500 mt-0.5">Transparent, blockchain-tracked donations — every dollar, provably spent.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/login" className="text-sm font-semibold border border-[rgba(0,0,0,0.2)] text-gray-700 px-4 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="text-sm font-semibold border border-emerald-700 text-emerald-700 px-4 py-1.5 rounded-full hover:bg-emerald-50 transition-colors">
              Join now
            </Link>
          </div>
        </div>
      )}

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_260px] gap-5">
        {/* Left sidebar — hidden on mobile, shown on lg */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <LeftSidebar session={session} stats={stats} />
          </div>
        </div>

        {/* Center feed */}
        <div>
          <Feed initial={initial} initialCursor={initialCursor} />
        </div>

        {/* Right sidebar — hidden on mobile, shown on lg */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <RightSidebar featuredProjects={featuredProjects} recentNgos={recentNgos} />
          </div>
        </div>
      </div>
    </main>
  );
}
