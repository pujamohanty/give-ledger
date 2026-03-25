"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Filter,
  Landmark,
  MapPin,
  Search,
  Shield,
  X,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATE_LABELS: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "Washington D.C.",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", PR: "Puerto Rico", RI: "Rhode Island",
  SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
  UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

const NTEE_GROUPS: Record<string, string> = {
  A: "Arts & Culture", B: "Education", C: "Environment", D: "Animals",
  E: "Health Care", F: "Mental Health", G: "Diseases & Disorders",
  H: "Medical Research", I: "Crime & Legal", J: "Employment",
  K: "Food & Agriculture", L: "Housing", M: "Public Safety",
  N: "Recreation & Sports", O: "Youth Development", P: "Human Services",
  Q: "International", R: "Civil Rights", S: "Community Improvement",
  T: "Philanthropy & Grantmaking", U: "Science & Tech", V: "Social Science",
  W: "Public Benefit", X: "Religion", Y: "Mutual Benefit", Z: "Unclassified",
};

const SUBSECTION_OPTIONS = [
  { value: "3", label: "501(c)(3) — Charitable" },
  { value: "4", label: "501(c)(4) — Social Welfare" },
  { value: "5", label: "501(c)(5) — Labor/Agriculture" },
  { value: "6", label: "501(c)(6) — Business League" },
  { value: "7", label: "501(c)(7) — Social Club" },
  { value: "13", label: "501(c)(13) — Cemetery" },
  { value: "19", label: "501(c)(19) — Veterans" },
];

const AVATAR_COLORS = [
  "bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500",
  "bg-rose-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string) {
  const p = name.trim().split(" ");
  return p.length === 1 ? p[0][0]?.toUpperCase() ?? "?" : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function formatDollars(val: string | null): string {
  if (!val) return "N/A";
  const n = parseInt(val, 10);
  if (isNaN(n)) return "N/A";
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatEin(ein: string) {
  if (ein.includes("-")) return ein;
  if (ein.length < 3) return ein;
  return `${ein.slice(0, 2)}-${ein.slice(2)}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrgResult {
  id: string;
  ein: string;
  name: string;
  city: string | null;
  state: string | null;
  nteeCode: string | null;
  subsection: number | null;
  revenueAmount: string | null;
  assetAmount: string | null;
  deductibility: number | null;
  ngoId: string | null;
  filings: {
    taxYear: number;
    totalRevenue: string | null;
    totalExpenses: string | null;
    totalAssetsEOY: string | null;
    pctOfficerCompensation: number | null;
  }[];
}

interface SearchResult {
  organizations: OrgResult[];
  pagination: { page: number; pageSize: number; totalCount: number; totalPages: number };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function IrsDirectoryClient() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("");
  const [ntee, setNtee] = useState("");
  const [subsection, setSubsection] = useState("");
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchOrgs = useCallback(async (p: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (state) params.set("state", state);
    if (ntee) params.set("ntee", ntee);
    if (subsection) params.set("subsection", subsection);
    params.set("sort", sort);
    params.set("order", order);
    params.set("page", String(p));
    params.set("pageSize", "25");

    try {
      const res = await fetch(`/api/irs/organizations?${params}`);
      const json: SearchResult = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query, state, ntee, subsection, sort, order]);

  // Debounced search on query change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchOrgs(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, state, ntee, subsection, sort, order, fetchOrgs]);

  // Page change
  useEffect(() => {
    fetchOrgs(page);
  }, [page, fetchOrgs]);

  const orgs = data?.organizations ?? [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IRS Nonprofit Directory</h1>
          <p className="text-sm text-gray-500">
            {pagination ? `${pagination.totalCount.toLocaleString()} tax-exempt organizations` : "Loading..."}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by organization name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-300 hover:text-gray-500" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition flex items-center gap-2 ${
            showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-white rounded-xl border border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500/30">
              <option value="">All states</option>
              {Object.entries(STATE_LABELS).sort((a, b) => a[1].localeCompare(b[1])).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category (NTEE)</label>
            <select value={ntee} onChange={(e) => setNtee(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500/30">
              <option value="">All categories</option>
              {Object.entries(NTEE_GROUPS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tax Code</label>
            <select value={subsection} onChange={(e) => setSubsection(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500/30">
              <option value="">All types</option>
              {SUBSECTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sort by</label>
            <select
              value={`${sort}-${order}`}
              onChange={(e) => {
                const [s, o] = e.target.value.split("-");
                setSort(s);
                setOrder(o as "asc" | "desc");
              }}
              className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="revenue-desc">Revenue (highest)</option>
              <option value="revenue-asc">Revenue (lowest)</option>
              <option value="assets-desc">Assets (highest)</option>
              <option value="assets-asc">Assets (lowest)</option>
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && orgs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-300 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Searching...
        </div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No organizations found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgs.map((org) => {
              const stateLabel = org.state ? (STATE_LABELS[org.state] ?? org.state) : null;
              const nteeLabel = org.nteeCode ? (NTEE_GROUPS[org.nteeCode[0]] ?? null) : null;
              const latestFiling = org.filings[0];

              return (
                <Link
                  key={org.id}
                  href={`/irs-directory/${org.ein}`}
                  className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-150 p-5 flex flex-col gap-3"
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${avatarColor(org.name)} flex items-center justify-center text-white font-bold text-base shrink-0`}>
                      {initials(org.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">{org.name}</p>
                      {(org.city || stateLabel) && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {[org.city, stateLabel].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category + EIN */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {nteeLabel && (
                      <span className="bg-gray-50 px-2 py-0.5 rounded-full truncate">{nteeLabel}</span>
                    )}
                    <span className="text-gray-300 ml-auto font-mono">{formatEin(org.ein)}</span>
                  </div>

                  {/* Financial snapshot */}
                  {(latestFiling || org.revenueAmount) && (
                    <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        Rev: {formatDollars(latestFiling?.totalRevenue ?? org.revenueAmount)}
                      </span>
                      {latestFiling?.totalAssetsEOY && (
                        <span className="flex items-center gap-1">
                          <Landmark className="w-3.5 h-3.5 text-blue-400" />
                          Assets: {formatDollars(latestFiling.totalAssetsEOY)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1">
                    {org.deductibility === 1 && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Tax Deductible
                      </span>
                    )}
                    {org.subsection === 3 && (
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        501(c)(3)
                      </span>
                    )}
                    {org.ngoId && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Shield className="w-3 h-3" /> On GiveLedger
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages.toLocaleString()}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
