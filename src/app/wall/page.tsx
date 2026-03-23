import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import WallClient from "./WallClient";
import { Activity } from "lucide-react";

export const metadata = {
  title: "Activity Wall — GiveLedger",
  description: "See what's happening across the GiveLedger platform — donations, milestones completed, new projects and more.",
};

export default async function WallPage() {
  const session = await auth();

  const LIMIT = 20;
  const [events, subscription] = await Promise.all([
    prisma.activityEvent.findMany({ take: LIMIT + 1, orderBy: { createdAt: "desc" } }),
    session?.user?.role === "DONOR"
      ? prisma.subscription.findUnique({ where: { userId: session.user.id }, select: { plan: true } })
      : Promise.resolve(null),
  ]);
  const isPro = subscription?.plan === "PRO";

  const hasMore = events.length > LIMIT;
  const items = hasMore ? events.slice(0, LIMIT) : events;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} isPro={isPro} />

      <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Activity Wall</h1>
              <p className="text-sm text-gray-500">Every contribution on this feed is real-time and verified. The people contributing right now are building credentials and Impact Scores. Yours starts when you do.</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: "Donation", color: "bg-rose-100 text-rose-700" },
              { label: "Milestone", color: "bg-emerald-100 text-emerald-700" },
              { label: "New Project", color: "bg-blue-100 text-blue-700" },
              { label: "Skill", color: "bg-violet-100 text-violet-700" },
            ].map((t) => (
              <span key={t.label} className={`text-xs font-medium px-2.5 py-1 rounded-full ${t.color}`}>
                {t.label}
              </span>
            ))}
          </div>
        </div>

        <WallClient
          initial={items.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() }))}
          initialCursor={nextCursor}
        />
      </div>
    </div>
  );
}
