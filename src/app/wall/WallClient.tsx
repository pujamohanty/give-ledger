"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, Heart, CheckCircle2, Rocket, Star, Briefcase, Users, ChevronRight } from "lucide-react";

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const EVENT_CONFIG: Record<string, { icon: React.ElementType; bg: string; color: string; label: string }> = {
  DONATION:          { icon: Heart,         bg: "bg-rose-100",    color: "text-rose-600",    label: "Donation" },
  MILESTONE_COMPLETE:{ icon: CheckCircle2,  bg: "bg-emerald-100", color: "text-emerald-600", label: "Milestone" },
  PROJECT_LAUNCH:    { icon: Rocket,        bg: "bg-blue-100",    color: "text-blue-600",    label: "New Project" },
  SKILL_APPROVED:    { icon: Briefcase,     bg: "bg-violet-100",  color: "text-violet-600",  label: "Skill" },
  NGO_JOINED:        { icon: Users,         bg: "bg-amber-100",   color: "text-amber-600",   label: "NGO Joined" },
  NGO_ENDORSEMENT:   { icon: Star,          bg: "bg-amber-100",   color: "text-amber-600",   label: "Endorsement" },
  DONOR_ENDORSEMENT: { icon: Star,          bg: "bg-amber-100",   color: "text-amber-600",   label: "Endorsement" },
};

function EventCard({ event }: { event: ActivityEvent }) {
  const cfg = EVENT_CONFIG[event.type] ?? { icon: Star, bg: "bg-gray-100", color: "text-gray-600", label: event.type };
  const Icon = cfg.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{timeAgo(event.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-800 mt-1.5 leading-relaxed">{event.description}</p>
          {(event.ngoName || event.projectTitle) && (
            <p className="text-xs text-gray-400 mt-1">
              {[event.ngoName, event.projectTitle].filter(Boolean).join(" · ")}
            </p>
          )}
          {event.linkUrl && (
            <Link
              href={event.linkUrl}
              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-2 font-medium"
            >
              View details <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WallClient({ initial, initialCursor }: {
  initial: ActivityEvent[];
  initialCursor: string | null;
}) {
  const [events, setEvents] = useState<ActivityEvent[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wall?cursor=${cursor}`);
      const data = await res.json();
      setEvents((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch { /* silent */ } finally { setLoading(false); }
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 text-sm">No activity yet. Come back after donations are made!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}

      {cursor && (
        <div className="text-center pt-2">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm text-emerald-700 font-medium border border-emerald-200 rounded-lg px-5 py-2 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      {!cursor && events.length > 0 && (
        <p className="text-center text-xs text-gray-400 pt-2">You&apos;re all caught up!</p>
      )}
    </div>
  );
}
