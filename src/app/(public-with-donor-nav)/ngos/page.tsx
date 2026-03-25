import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Landmark, MapPin, Search, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Nonprofits — GiveLedger",
  description: "Search 1.9 million IRS-verified US nonprofits.",
};

const PER_PAGE = 24;

const NTEE_CATEGORIES: Record<string, string> = {
  A: "Arts & Culture", B: "Education", C: "Environment", D: "Animal-Related",
  E: "Health Care", F: "Mental Health", G: "Disease & Medical", H: "Medical Research",
  I: "Crime & Legal", J: "Employment", K: "Food & Agriculture", L: "Housing",
  M: "Public Safety", N: "Recreation & Sports", O: "Youth Development",
  P: "Human Services", Q: "International Affairs", R: "Civil Rights",
  S: "Community Improvement", T: "Philanthropy", U: "Science & Technology",
  V: "Social Science", W: "Public & Societal Benefit", X: "Religion",
  Y: "Mutual Benefit",
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

function formatRevenue(n: bigint | null | undefined): string {
  if (n == null) return "";
  const v = Number(n);
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}

export default async function NgosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; ntee?: string; page?: string }>;
}) {
  const { q = "", state = "", ntee = "", page: pageStr = "0" } = await searchParams;
  const page = Math.max(0, parseInt(pageStr, 10) || 0);
  const session = await auth();

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(state ? { state } : {}),
    ...(ntee ? { nteeCode: { startsWith: ntee } } : {}),
  };

  const [orgs, total] = await Promise.all([
    prisma.irsOrganization.findMany({
      where,
      select: {
        ein: true,
        name: true,
        city: true,
        state: true,
        nteeCode: true,
        subsection: true,
        revenueAmount: true,
        ngo: { select: { id: true } },
      },
      orderBy: { revenueAmount: "desc" },
      skip: page * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.irsOrganization.count({ where }),
  ]).catch(() => [[], 0] as const);

  const totalPages = Math.ceil(total / PER_PAGE);
  const hasFilters = !!(q || state || ntee);

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (state) params.set("state", state);
    if (ntee) params.set("ntee", ntee);
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
              : "Search 1,938,732 IRS-verified nonprofit organisations"}
          </p>
        </div>

        {/* Search & Filters — GET form, no JS needed */}
        <form method="GET" action="/ngos" className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by organisation name…"
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
          <select
            name="ntee"
            defaultValue={ntee}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          >
            <option value="">All categories</option>
            {Object.entries(NTEE_CATEGORIES).map(([code, label]) => (
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

        {/* Results grid */}
        {orgs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {orgs.map((org) => {
                const nteeLetter = org.nteeCode?.charAt(0).toUpperCase();
                const category = nteeLetter ? (NTEE_CATEGORIES[nteeLetter] ?? null) : null;
                const isOnPlatform = !!org.ngo;

                return (
                  <Link
                    key={org.ein}
                    href={`/ngo/${org.ein}`}
                    className="bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-150 p-5 flex flex-col gap-3 group"
                  >
                    {/* Avatar + Name */}
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-full ${avatarColor(org.name)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                        {initials(org.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-emerald-700 line-clamp-2">
                          {org.name}
                        </p>
                        {(org.city || org.state) && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {[org.city, org.state ? (STATE_LABELS[org.state] ?? org.state) : null].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Category + Revenue */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {category && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[60%]">{category}</span>
                      )}
                      {org.revenueAmount != null && Number(org.revenueAmount) > 0 && (
                        <span className="flex items-center gap-1 text-emerald-700 font-medium ml-auto">
                          <DollarSign className="w-3 h-3" />
                          {formatRevenue(org.revenueAmount)} revenue
                        </span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-50">
                      <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        EIN {org.ein}
                      </span>
                      {org.subsection === 3 && (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          501(c)(3)
                        </span>
                      )}
                      {isOnPlatform && (
                        <span className="text-[10px] font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                          On GiveLedger
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

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
            <p className="text-xs mt-1">Try a different name, state, or category</p>
          </div>
        )}
      </div>
    </div>
  );
}
