"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, ChevronLeft, ChevronRight, DollarSign, Filter, Landmark, MapPin, Search, Shield, X } from "lucide-react";

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

function formatDollars(n?: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatEin(ein: string): string {
  if (!ein) return "";
  const clean = ein.replace(/-/g, "").padStart(9, "0");
  return `${clean.slice(0, 2)}-${clean.slice(2)}`;
}

interface Org {
  ein: string;
  name: string;
  city?: string;
  state?: string;
  ntee_code?: string;
  subsection_code?: number;
  revenue_amount?: number;
  asset_amount?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function IrsDirectoryClient() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [nteeFilter, setNteeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounce search query
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (stateFilter) params.set("state", stateFilter);
      if (nteeFilter) params.set("ntee", nteeFilter);
      params.set("page", String(page));

      const res = await fetch(`/api/irs/organizations?${params}`);
      const data = await res.json();
      setOrgs(data.organizations ?? []);
      setTotalResults(data.total_results ?? 0);
    } catch {
      setOrgs([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, stateFilter, nteeFilter, page]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  const PER_PAGE = 25;
  const totalPages = Math.ceil(totalResults / PER_PAGE);
  const hasFilters = stateFilter || nteeFilter;

  function clearFilters() {
    setStateFilter("");
    setNteeFilter("");
    setPage(0);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">IRS Nonprofit Directory</h1>
        <p className="text-gray-500">Search 1.8 million US tax-exempt organizations. Data from IRS via ProPublica.</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by organization name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
            showFilters || hasFilters
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">State</label>
            <select
              value={stateFilter}
              onChange={(e) => { setStateFilter(e.target.value); setPage(0); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All States</option>
              {Object.entries(STATE_LABELS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Category (NTEE)</label>
            <select
              value={nteeFilter}
              onChange={(e) => { setNteeFilter(e.target.value); setPage(0); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Categories</option>
              {Object.entries(NTEE_GROUPS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <div className="sm:col-span-2">
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      {!loading && debouncedQuery && (
        <p className="text-sm text-gray-500 mb-4">
          {totalResults.toLocaleString()} results{debouncedQuery ? ` for "${debouncedQuery}"` : ""}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && orgs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">
            {debouncedQuery ? "No organizations found" : "Search for an organization above"}
          </p>
          <p className="text-sm mt-1">
            {debouncedQuery ? "Try a different name or adjust filters" : "Type a name, cause, or location"}
          </p>
        </div>
      )}

      {/* Results grid */}
      {!loading && orgs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {orgs.map((org) => (
            <Link
              key={org.ein}
              href={`/irs-directory/${org.ein}`}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-sm transition group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-blue-700">
                    {org.name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-700 line-clamp-2 leading-snug">{org.name}</p>
                  {(org.city || org.state) && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {[org.city, org.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[11px] font-mono text-gray-400">EIN: {formatEin(org.ein)}</span>
                    {org.ntee_code && (
                      <span className="text-[11px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                        {NTEE_GROUPS[org.ntee_code?.[0]] ?? org.ntee_code}
                      </span>
                    )}
                    {org.subsection_code === 3 && (
                      <span className="text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> 501(c)(3)
                      </span>
                    )}
                  </div>
                  {(org.revenue_amount || org.asset_amount) && (
                    <div className="flex gap-3 mt-2">
                      {org.revenue_amount != null && org.revenue_amount > 0 && (
                        <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3" /> Revenue: {formatDollars(org.revenue_amount)}
                        </span>
                      )}
                      {org.asset_amount != null && org.asset_amount > 0 && (
                        <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
                          <Landmark className="w-3 h-3" /> Assets: {formatDollars(org.asset_amount)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-8">
        Data from{" "}
        <a href="https://projects.propublica.org/nonprofits/" target="_blank" rel="noopener noreferrer" className="underline">
          ProPublica Nonprofit Explorer
        </a>{" "}
        · Updated from IRS records
      </p>
    </div>
  );
}
