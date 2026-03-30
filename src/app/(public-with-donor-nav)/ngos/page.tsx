import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Landmark, MapPin, Search, ChevronLeft, ChevronRight, Shield } from "lucide-react";

export const metadata = {
  title: "Nonprofits — GiveLedger",
  description: "Browse IRS-verified US nonprofits on GiveLedger.",
};

const PER_PAGE = 50;

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
  DC: "D.C.",
};

const AVATAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-indigo-500", "bg-teal-500", "bg-cyan-500",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type NgoItem = {
  id: string;
  orgName: string;
  state: string | null;
  description: string | null;
  ein: string | null;
  trustScore: number;
  _count: { projects: number };
};

function NgoCard({ ngo }: { ngo: NgoItem }) {
  return (
    <Link
      href={`/ngo/${ngo.id}`}
      className="bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-150 p-5 flex flex-col gap-3 group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-full ${avatarColor(ngo.orgName)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {initials(ngo.orgName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-emerald-700 line-clamp-2">
            {ngo.orgName}
          </p>
          {ngo.state && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              {STATE_LABELS[ngo.state] ?? ngo.state}, United States
            </p>
          )}
        </div>
      </div>

      {ngo.description && (
        <p className="text-xs text-gray-500 line-clamp-2">{ngo.description}</p>
      )}

      <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-50 items-center">
        {ngo.ein && (
          <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            EIN {ngo.ein}
          </span>
        )}
        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          On GiveLedger
        </span>
        {ngo._count.projects > 0 && (
          <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-auto">
            {ngo._count.projects} project{ngo._count.projects !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {ngo.trustScore > 0 && (
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, ngo.trustScore)}%` }}
            />
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">{ngo.trustScore.toFixed(0)}/100</span>
        </div>
      )}
    </Link>
  );
}

export default async function NgosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; page?: string }>;
}) {
  const { q = "", state = "", page: pageStr = "0" } = await searchParams;
  const page = Math.max(0, parseInt(pageStr, 10) || 0);
  const session = await auth();

  const where = {
    status: "ACTIVE" as const,
    ...(q ? { orgName: { contains: q, mode: "insensitive" as const } } : {}),
    ...(state ? { state } : {}),
  };

  const [ngos, total] = await Promise.all([
    prisma.ngo.findMany({
      where,
      select: {
        id: true,
        orgName: true,
        state: true,
        description: true,
        ein: true,
        trustScore: true,
        _count: { select: { projects: true } },
      },
      orderBy: state
        ? [{ orgName: "asc" as const }]
        : [{ state: "asc" as const }, { orgName: "asc" as const }],
      skip: page * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.ngo.count({ where }),
  ]).catch(() => [[], 0] as const);

  const totalPages = Math.ceil(total / PER_PAGE);
  const hasFilters = !!(q || state);

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (state) params.set("state", state);
    if (p > 0) params.set("page", String(p));
    const s = params.toString();
    return `/ngos${s ? `?${s}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Landmark className="w-5 h-5 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">US Nonprofits</h1>
          </div>
          <p className="text-sm text-gray-500 ml-13 pl-1">
            {hasFilters
              ? `${total.toLocaleString()} result${total !== 1 ? "s" : ""}`
              : `${total.toLocaleString()} verified nonprofit${total !== 1 ? "s" : ""} on GiveLedger`}
          </p>
        </div>

        {/* Search & Filters */}
        <form method="GET" action="/ngos" className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by organisation name..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <select
            name="state"
            defaultValue={state}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          >
            <option value="">All states</option>
            {Object.entries(STATE_LABELS).sort((a, b) => a[1].localeCompare(b[1])).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Search
          </button>
          {hasFilters && (
            <Link href="/ngos" className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg border border-gray-200 text-center">
              Clear
            </Link>
          )}
        </form>

        {/* Results */}
        {ngos.length > 0 ? (
          <>
            {(() => {
              if (!state) {
                // Group by state
                const groups: { stateCode: string; items: NgoItem[] }[] = [];
                for (const ngo of ngos) {
                  const key = ngo.state ?? "";
                  const last = groups[groups.length - 1];
                  if (last && last.stateCode === key) {
                    last.items.push(ngo);
                  } else {
                    groups.push({ stateCode: key, items: [ngo] });
                  }
                }
                return (
                  <div className="space-y-8 mb-8">
                    {groups.map(({ stateCode, items }) => (
                      <div key={stateCode}>
                        {stateCode && (
                          <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                              {STATE_LABELS[stateCode] ?? stateCode}
                            </h2>
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 whitespace-nowrap">{items.length} org{items.length !== 1 ? "s" : ""}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {items.map((ngo) => <NgoCard key={ngo.id} ngo={ngo} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {ngos.map((ngo) => <NgoCard key={ngo.id} ngo={ngo} />)}
                </div>
              );
            })()}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page + 1} of {totalPages.toLocaleString()} · {total.toLocaleString()} orgs
                </p>
                <div className="flex gap-2">
                  {page > 0 && (
                    <Link href={buildUrl(page - 1)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Link>
                  )}
                  {page < totalPages - 1 && (
                    <Link href={buildUrl(page + 1)}
                      className="flex items-center gap-1 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-3 py-1.5">
                      Next <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Landmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No organisations found</p>
            <p className="text-xs mt-1">
              {hasFilters ? "Try a different name or state" : "No approved NGOs yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
