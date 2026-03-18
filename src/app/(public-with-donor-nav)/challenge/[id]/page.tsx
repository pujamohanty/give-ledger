import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { auth } from "@/lib/auth";
import ChallengeActions from "./ChallengeActions";
import { BadgeCheck, Calendar, Target, Users, Briefcase, MapPin, ExternalLink } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = await prisma.donorChallenge.findUnique({
    where: { id },
    include: {
      donor: { select: { name: true } },
      project: { select: { title: true } },
      ngo: { select: { orgName: true } },
    },
  });
  if (!challenge) return { title: "Challenge — GiveLedger" };
  const target = challenge.project?.title ?? challenge.ngo?.orgName ?? "an NGO";
  const verb = challenge.challengeType === "SKILL" ? "skill contribution to" : "donation to";
  return {
    title: `${challenge.donor.name ?? "Someone"} challenged you — GiveLedger`,
    description: `${challenge.donor.name ?? "A donor"} made a ${verb} ${target}. Accept their challenge.`,
  };
}

const AVATAR_COLORS = [
  "bg-rose-500", "bg-blue-500", "bg-violet-500", "bg-amber-500",
  "bg-emerald-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
];
function avatarColor(name: string | null | undefined) {
  if (!name) return "bg-gray-400";
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name: string | null | undefined) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function daysLeft(deadline: Date | null) {
  if (!deadline) return null;
  return Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, challenge] = await Promise.all([
    auth(),
    prisma.donorChallenge.findUnique({
      where: { id },
      include: {
        donor: { select: { id: true, name: true, jobTitle: true, company: true } },
        project: {
          select: {
            id: true, title: true, category: true,
            goalAmount: true, raisedAmount: true,
            ngo: { select: { orgName: true } },
          },
        },
        ngo: { select: { id: true, orgName: true, description: true, state: true } },
        acceptances: {
          select: { id: true, name: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ]);

  if (!challenge) notFound();

  // Fetch role if linked
  let role: { id: string; title: string; roleType: string; isRemote: boolean } | null = null;
  if (challenge.roleId) {
    role = await prisma.ngoRole.findUnique({
      where: { id: challenge.roleId },
      select: { id: true, title: true, roleType: true, isRemote: true },
    });
  }

  const isSkill = challenge.challengeType === "SKILL";
  const days = daysLeft(challenge.deadline);
  const isExpired = days !== null && days < 0;
  const acceptCount = challenge.acceptances.length;

  // Financial challenge extras
  const progress = challenge.project
    ? Math.min(100, Math.round((challenge.project.raisedAmount / challenge.project.goalAmount) * 100))
    : 0;

  // Accept link
  const acceptHref = isSkill
    ? (role ? `/opportunities/${role.id}` : `/ngo/${challenge.ngo?.id}`)
    : `/projects/${challenge.project?.id}`;

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />

      <div className="max-w-xl mx-auto px-4 py-10 sm:px-6">

        {/* Challenge card */}
        <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.06)] p-6 mb-4">

          {/* Type badge */}
          <div className="flex justify-end mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              isSkill
                ? "bg-violet-100 text-violet-700"
                : "bg-rose-100 text-rose-700"
            }`}>
              {isSkill ? "Skill Challenge" : "Donation Challenge"}
            </span>
          </div>

          {/* Challenger */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-14 h-14 rounded-full ${avatarColor(challenge.donor.name)} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
              {initials(challenge.donor.name)}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-base">{challenge.donor.name ?? "A donor"}</p>
              {(challenge.donor.jobTitle || challenge.donor.company) && (
                <p className="text-xs text-gray-500">
                  {[challenge.donor.jobTitle, challenge.donor.company].filter(Boolean).join(" · ")}
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                <BadgeCheck className="w-3 h-3" /> Verified Donor
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center py-5 border-y border-gray-100 mb-5">
            {isSkill ? (
              <>
                <p className="text-sm text-gray-500 mb-2">contributed their skills to</p>
                <p className="text-2xl font-black text-gray-900">{challenge.ngo?.orgName}</p>
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full">
                    <Briefcase className="w-3 h-3" /> {challenge.skillCategory}
                  </span>
                  {challenge.hoursContributed && (
                    <span className="text-xs text-gray-500">{challenge.hoursContributed} hours</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-3 font-medium">and challenges you to do the same</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-1">challenged you to donate</p>
                <p className="text-5xl font-black text-gray-900">${challenge.amount?.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">to support this project</p>
              </>
            )}
          </div>

          {/* Message */}
          {challenge.message && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5 border-l-4 border-emerald-400">
              <p className="text-sm text-gray-700 italic">&ldquo;{challenge.message}&rdquo;</p>
            </div>
          )}

          {/* Context card — project (financial) or NGO + role (skill) */}
          {isSkill ? (
            <div className="space-y-3 mb-5">
              {/* NGO card */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm">{challenge.ngo?.orgName}</p>
                {challenge.ngo?.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{challenge.ngo.description}</p>
                )}
                {challenge.ngo?.state && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {challenge.ngo.state}
                  </p>
                )}
              </div>
              {/* Role card */}
              {role && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Open Role</p>
                  <p className="font-semibold text-gray-900 text-sm">{role.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500">{role.roleType.replace("_", " ")}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{role.isRemote ? "Remote" : "On-site"}</span>
                  </div>
                </div>
              )}
            </div>
          ) : challenge.project ? (
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs text-gray-400 mb-1">{challenge.project.ngo.orgName}</p>
              <p className="font-semibold text-gray-900 text-sm mb-3">{challenge.project.title}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>${challenge.project.raisedAmount.toLocaleString()} raised</span>
                <span>{progress}% of ${challenge.project.goalAmount.toLocaleString()}</span>
              </div>
            </div>
          ) : null}

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-5 flex-wrap">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-violet-400" />
              {acceptCount} {acceptCount === 1 ? "person" : "people"} accepted
            </span>
            {days !== null && (
              <span className={`flex items-center gap-1 ${isExpired ? "text-red-400" : days <= 3 ? "text-amber-500" : ""}`}>
                <Calendar className="w-3.5 h-3.5" />
                {isExpired ? "Challenge expired" : `${days} day${days !== 1 ? "s" : ""} left`}
              </span>
            )}
            {!isSkill && challenge.amount && (
              <span className="flex items-center gap-1 ml-auto">
                <Target className="w-3.5 h-3.5 text-rose-400" />
                Goal: ${challenge.amount.toLocaleString()}
              </span>
            )}
          </div>

          {/* CTA + share */}
          <ChallengeActions
            challengeId={challenge.id}
            acceptHref={acceptHref}
            projectTitle={challenge.project?.title ?? challenge.ngo?.orgName ?? "this cause"}
            donorName={challenge.donor.name ?? "A donor"}
            amount={challenge.amount ?? null}
            isSkill={isSkill}
            skillCategory={challenge.skillCategory ?? null}
            isExpired={isExpired}
            initialCount={acceptCount}
          />
        </div>

        {/* Acceptances list */}
        {acceptCount > 0 && (
          <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] p-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Who accepted</p>
            <div className="space-y-2">
              {challenge.acceptances.slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isSkill ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {a.name ? a.name[0].toUpperCase() : "?"}
                  </div>
                  <span>{a.name ?? "Anonymous"}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
              {acceptCount > 10 && <p className="text-xs text-gray-400">+{acceptCount - 10} more</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
