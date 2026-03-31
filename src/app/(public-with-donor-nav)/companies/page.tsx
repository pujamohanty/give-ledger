import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import {
  Building2, MapPin, Search, ChevronLeft, ChevronRight,
  Briefcase, Globe, BadgeCheck, Users,
} from "lucide-react";

export const metadata = {
  title: "Companies — GiveLedger",
  description: "Browse for-profit companies hiring AI-augmented generalists. Verified SAM.gov + OpenCorporates data.",
};

const PER_PAGE = 24;

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

// NAICS sector filter options
const NAICS_SECTORS = [
  { code: "5415", label: "Technology & Software" },
  { code: "5418", label: "Marketing & Advertising" },
  { code: "522",  label: "Financial Services" },
  { code: "621",  label: "Healthcare" },
  { code: "5411", label: "Legal Services" },
  { code: "611",  label: "Education & Training" },
  { code: "531",  label: "Real Estate" },
  { code: "5613", label: "HR & Staffing" },
  { code: "484",  label: "Logistics & Freight" },
  { code: "515",  label: "Media & Entertainment" },
  { code: "5416", label: "Management Consulting" },
  { code: "5412", label: "Accounting & Finance" },
];

const SBA_OPTIONS = [
  "Woman Owned Small Business",
  "Veteran-Owned Small Business",
  "Service-Disabled Veteran-Owned Small Business",
  "HUBZone Firm",
  "8(a) Certified",
];

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-indigo-500", "bg-cyan-500",
  "bg-sky-500", "bg-teal-500", "bg-emerald-500", "bg-amber-500",
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

type CompanyItem = {
  id: string;
  legalName: string;
  dbaName: string | null;
  city: string | null;
  state: string | null;
  naicsDescription: string | null;
  naicsPrimary: string | null;
  sbaDesignations: string[];
  businessTypes: string[];
  employeeRange: string | null;
  samRegistered: boolean;
  ocRegistered: boolean;
  website: string | null;
};

function CompanyCard({ company: co }: { company: CompanyItem }) {
  const displayName = co.dbaName ?? co.legalName;
  return (
    <Link
      href={`/companies/${co.id}`}
      className="bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-150 p-5 flex flex-col gap-3 group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl ${avatarColor(co.legalName)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
          {initials(displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-700 line-clamp-2">
            {displayName}
          </p>
          {(co.city || co.state) && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              {[co.city, co.state ? (STATE_LABELS[co.state] ?? co.state) : null].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {co.naicsDescription && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 line-clamp-1">
          {co.naicsDescription}
        </p>
      )}

      {co.sbaDesignations.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {co.sbaDesignations.slice(0, 2).map((d) => (
            <span key={d} className="text-[10px] font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
              {d.replace("Small Business", "").replace("Certified", "").trim()}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-50 items-center">
        {co.samRegistered && (
          <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <BadgeCheck className="w-2.5 h-2.5" /> SAM.gov
          </span>
        )}
        {co.ocRegistered && (
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <BadgeCheck className="w-2.5 h-2.5" /> Incorporated
          </span>
        )}
        {co.employeeRange && (
          <span className="text-[10px] text-gray-400 flex items-center gap-0.5 ml-auto">
            <Users className="w-2.5 h-2.5" /> {co.employeeRange} employees
          </span>
        )}
      </div>
    </Link>
  );
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; naics?: string; sba?: string; page?: string }>;
}) {
  const { q = "", state = "", naics = "", sba = "", page: pageStr = "0" } = await searchParams;
  const page = Math.max(0, parseInt(pageStr, 10) || 0);
  const session = await auth();

  const where = {
    isActive: true,
    ...(q ? { legalName: { startsWith: q, mode: "insensitive" as const } } : {}),
    ...(state ? { state } : {}),
    ...(naics ? { naicsPrimary: { startsWith: naics } } : {}),
    ...(sba ? { sbaDesignations: { has: sba } } : {}),
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      select: {
        id: true,
        legalName: true,
        dbaName: true,
        city: true,
        state: true,
        naicsDescription: true,
        naicsPrimary: true,
        sbaDesignations: true,
        businessTypes: true,
        employeeRange: true,
        samRegistered: true,
        ocRegistered: true,
        website: true,
      },
      orderBy: [{ legalName: "asc" }],
      skip: page * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.company.count({ where }),
  ]).catch(() => [[], 0] as const);

  const totalPages = Math.ceil(total / PER_PAGE);
  const hasFilters = !!(q || state || naics || sba);

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (state) params.set("state", state);
    if (naics) params.set("naics", naics);
    if (sba) params.set("sba", sba);
    if (p > 0) params.set("page", String(p));
    const s = params.toString();
    return `/companies${s ? `?${s}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />

      <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">For-Profit Companies</h1>
              <p className="text-sm text-gray-500">
                {hasFilters
                  ? `${total.toLocaleString()} result${total !== 1 ? "s" : ""}`
                  : "SAM.gov & OpenCorporates verified US businesses — AI-augmented roles available"}
              </p>
            </div>
          </div>

          {/* Value prop strip */}
          {!hasFilters && total === 0 && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Use your GiveLedger credential at real companies
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Import companies by running <code className="bg-blue-100 px-1 rounded">npm run import:sam-companies</code> after adding your SAM_GOV_API_KEY to .env.
                  Every company shows AI-generated role suggestions tailored to their sector.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <form method="GET" action="/companies" className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Type the start of a company name…"
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <select
              name="state"
              defaultValue={state}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">All states</option>
              {Object.entries(STATE_LABELS).sort((a, b) => a[1].localeCompare(b[1])).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              Search
            </button>
            {hasFilters && (
              <Link href="/companies" className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg border border-gray-200 text-center">
                Clear
              </Link>
            )}
          </div>

          {/* Sector + SBA filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              name="naics"
              defaultValue={naics}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">All sectors</option>
              {NAICS_SECTORS.map((s) => (
                <option key={s.code} value={s.code}>{s.label}</option>
              ))}
            </select>
            <select
              name="sba"
              defaultValue={sba}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">All designations</option>
              {SBA_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </form>

        {/* Results */}
        {companies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {(companies as CompanyItem[]).map((co) => (
                <CompanyCard key={co.id} company={co} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page + 1} of {totalPages.toLocaleString()} · {total.toLocaleString()} companies
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
                      className="flex items-center gap-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5">
                      Next <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            {hasFilters ? (
              <>
                <p className="text-sm font-medium">No companies match your search</p>
                <p className="text-xs mt-1">Try a different name, state, or sector</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">No companies imported yet</p>
                <p className="text-xs mt-1 max-w-sm mx-auto">
                  Run <code className="bg-gray-100 px-1 rounded text-gray-600">npm run import:sam-companies</code> with a SAM_GOV_API_KEY to populate this directory
                </p>
                <Link
                  href="/career-compass"
                  className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Explore Career Compass sectors →
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
