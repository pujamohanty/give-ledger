import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Users, Heart, TrendingUp, BadgeCheck } from "lucide-react";

export const metadata = {
  title: "Donors — GiveLedger",
  description: "Meet the donors powering verified impact on GiveLedger.",
};

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

export default async function DonorsPage() {
  const session = await auth();

  const donors = await prisma.user.findMany({
    where: { role: "DONOR" },
    select: {
      id: true,
      name: true,
      jobTitle: true,
      company: true,
      city: true,
      skills: true,
      donations: { select: { amount: true } },
      skillContributions: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />

      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Donors</h1>
            <p className="text-sm text-gray-500">{donors.length} donors powering verified impact</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {donors.map((donor) => {
            const totalDonated = donor.donations.reduce((s, d) => s + d.amount, 0);
            const skillCount   = donor.skillContributions.length;
            const skillList    = donor.skills ? donor.skills.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3) : [];

            return (
              <Link
                key={donor.id}
                href={`/donor/${donor.id}/profile`}
                className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-150 p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${avatarColor(donor.name)} flex items-center justify-center text-white font-bold text-base shrink-0`}>
                    {initials(donor.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{donor.name ?? "Anonymous"}</p>
                    {(donor.jobTitle || donor.company) && (
                      <p className="text-xs text-gray-500 truncate">
                        {[donor.jobTitle, donor.company].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {donor.city && (
                      <p className="text-xs text-gray-400 truncate">{donor.city}</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    ${totalDonated.toLocaleString()} donated
                  </span>
                  {skillCount > 0 && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                      {skillCount} skill{skillCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Skill tags */}
                {skillList.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {skillList.map(s => (
                      <span key={s} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                    {donor.skills && donor.skills.split(",").length > 3 && (
                      <span className="text-[10px] font-medium bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                        +{donor.skills.split(",").length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                  <BadgeCheck className="w-3 h-3" /> Verified Donor
                </span>
              </Link>
            );
          })}
        </div>

        {donors.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No donors yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
