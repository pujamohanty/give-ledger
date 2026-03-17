import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Landmark, MapPin, Shield, TrendingUp, Users } from "lucide-react";

export const metadata = {
  title: "NGOs — GiveLedger",
  description: "Browse verified nonprofit organizations on GiveLedger.",
};

const STATE_LABELS: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "Washington D.C.",
};

const AVATAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
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

export default async function NgosPage() {
  const session = await auth();

  const ngos = await prisma.ngo.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      orgName: true,
      description: true,
      state: true,
      is501c3: true,
      trustScore: true,
      projects: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
      _count: {
        select: {
          projects: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />

      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Landmark className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Verified NGOs</h1>
            <p className="text-sm text-gray-500">{ngos.length} approved nonprofit organizations</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ngos.map((ngo) => {
            const activeProjects = ngo.projects.length;
            const stateLabel = ngo.state ? (STATE_LABELS[ngo.state] ?? ngo.state) : null;

            return (
              <Link
                key={ngo.id}
                href={`/ngo/${ngo.id}`}
                className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-150 p-5 flex flex-col gap-3"
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${avatarColor(ngo.orgName)} flex items-center justify-center text-white font-bold text-base shrink-0`}>
                    {initials(ngo.orgName)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{ngo.orgName}</p>
                    {stateLabel && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {stateLabel}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {ngo.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {ngo.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    {ngo._count.projects} project{ngo._count.projects !== 1 ? "s" : ""}
                  </span>

                  {activeProjects > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      {activeProjects} active
                    </span>
                  )}
                  {ngo.trustScore != null && (
                    <span className="flex items-center gap-1 ml-auto">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      {ngo.trustScore}%
                    </span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1">
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                    <Shield className="w-3 h-3" /> Verified NGO
                  </span>
                  {ngo.is501c3 && (
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      501(c)(3)
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {ngos.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Landmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No verified NGOs yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
