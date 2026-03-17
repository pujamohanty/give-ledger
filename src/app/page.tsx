import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import HomeFeedClient from "./HomeFeedClient";

export const metadata = {
  title: "GiveLedger — Transparent, Blockchain-Tracked Giving",
  description: "See real impact happening live. Every donation milestone-locked, every release on-chain.",
};

export default async function HomePage() {
  const session = await auth();

  const LIMIT = 20;

  const [events, donorCount, ngoCount, projectCount, milestoneCount, featuredProjectsRaw, recentNgosRaw, allProjectsRaw] =
    await Promise.all([
      prisma.activityEvent.findMany({ take: LIMIT + 1, orderBy: { createdAt: "desc" } }),
      prisma.user.count({ where: { role: "DONOR" } }),
      prisma.ngo.count({ where: { status: "ACTIVE" } }),
      prisma.project.count(),
      prisma.milestone.count({ where: { status: "COMPLETED" } }),
      prisma.project.findMany({
        take: 3,
        where: { status: "ACTIVE" },
        include: { ngo: { select: { orgName: true } } },
        orderBy: { raisedAmount: "desc" },
      }),
      prisma.ngo.findMany({
        take: 5,
        where: { status: "ACTIVE" },
        select: { id: true, orgName: true, description: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        where: { status: "ACTIVE" },
        include: {
          ngo: { select: { orgName: true } },
          _count: { select: { milestones: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const hasMore = events.length > LIMIT;
  const items = hasMore ? events.slice(0, LIMIT) : events;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />
      <HomeFeedClient
        initial={items.map(e => ({ ...e, createdAt: e.createdAt.toISOString() }))}
        initialCursor={nextCursor}
        stats={{ donors: donorCount, ngos: ngoCount, projects: projectCount, milestones: milestoneCount }}
        featuredProjects={featuredProjectsRaw.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          goalAmount: p.goalAmount,
          raisedAmount: p.raisedAmount,
          ngo: p.ngo,
        }))}
        recentNgos={recentNgosRaw}
        allProjects={allProjectsRaw.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          goalAmount: p.goalAmount,
          raisedAmount: p.raisedAmount,
          ngo: p.ngo,
          milestoneCount: p._count.milestones,
          createdAt: p.createdAt.toISOString(),
        }))}
        session={session?.user ? {
          name: session.user.name,
          image: session.user.image,
          role: (session.user as { role?: string }).role,
        } : null}
      />
    </div>
  );
}
