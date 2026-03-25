export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe, MapPin, Users, Target, CheckCircle, Linkedin, ExternalLink,
  Star, FileText, Image as ImageIcon, Sparkles, ArrowLeft,
  TrendingUp, DollarSign, Landmark, BarChart3, Building2,
} from "lucide-react";

const NTEE_CATEGORIES: Record<string, string> = {
  A: "Arts & Culture", B: "Education", C: "Environment", D: "Animal-Related",
  E: "Health Care", F: "Mental Health", G: "Disease & Medical", H: "Medical Research",
  I: "Crime & Legal", J: "Employment", K: "Food & Agriculture", L: "Housing",
  M: "Public Safety", N: "Recreation & Sports", O: "Youth Development",
  P: "Human Services", Q: "International Affairs", R: "Civil Rights",
  S: "Community Improvement", T: "Philanthropy", U: "Science & Technology",
  V: "Social Science", W: "Public & Societal Benefit", X: "Religion",
  Y: "Mutual Benefit", Z: "Unknown",
};

function nteeCategory(code?: string): string {
  if (!code) return "";
  return NTEE_CATEGORIES[code.charAt(0).toUpperCase()] ?? code;
}

// ruling stored as "YYYYMM" e.g. "201509" → "Sep 2015"
function formatRulingDate(ruling: string): string {
  if (!ruling || ruling.length < 6) return ruling;
  const year = ruling.slice(0, 4);
  const month = parseInt(ruling.slice(4, 6), 10);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[(month - 1) % 12] ?? ""} ${year}`;
}

function formatIrsDollars(n?: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

const categoryLabel: Record<string, string> = {
  INCOME_GENERATION: "Income Generation",
  CHILD_CARE: "Child Care",
  ELDERLY_CARE: "Elderly Care",
  PHYSICALLY_DISABLED: "Accessibility",
  PET_CARE: "Animal Welfare",
  OTHER: "Other",
};

const categoryEmoji: Record<string, string> = {
  INCOME_GENERATION: "🧵",
  CHILD_CARE: "💧",
  ELDERLY_CARE: "🏠",
  PHYSICALLY_DISABLED: "♿",
  PET_CARE: "🐾",
  OTHER: "🌱",
};

const docCategoryLabel: Record<string, string> = {
  PROJECT: "Past Project",
  GALLERY: "Gallery",
  REPORT: "Impact Report",
  LEGAL: "Legal",
  FOUNDER: "Founder Bio",
  OTHER: "Document",
};

function fetchIrsOrg(ein: string) {
  return prisma.irsOrganization.findUnique({
    where: { ein },
    include: { filings: { orderBy: { taxYear: "asc" as const }, take: 5 } },
  });
}

const NGO_INCLUDES = {
  boardMembers: { orderBy: { orderIndex: "asc" } as const },
  documents: {
    select: { id: true, fileName: true, category: true, mimeType: true, fileSize: true, caption: true, createdAt: true },
    orderBy: { createdAt: "desc" } as const,
  },
  projects: {
    where: { status: "ACTIVE" as const },
    include: { milestones: true, donations: { select: { userId: true } } },
    orderBy: { createdAt: "desc" } as const,
  },
  ratings: {
    include: { donor: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" } as const,
    take: 5,
  },
};

export default async function NgoProfilePage({
  params,
}: {
  params: Promise<{ ein: string }>;
}) {
  const { ein: rawEin } = await params;
  const cleanEin = rawEin.replace(/-/g, "").replace(/\s/g, "");

  // Detect whether the param is an EIN (9 digits) or an internal cuid
  const isEin = /^\d{9}$/.test(cleanEin);

  let irsOrg: Awaited<ReturnType<typeof fetchIrsOrg>> = null;
  let ngo: Awaited<ReturnType<typeof prisma.ngo.findFirst<{ include: typeof NGO_INCLUDES }>>> | null = null;
  const session = await auth();

  if (isEin) {
    // EIN-based lookup: used by /ngos directory and IRS profile links
    [irsOrg, ngo] = await Promise.all([
      fetchIrsOrg(cleanEin).catch(() => null),
      prisma.ngo.findFirst({
        where: { ein: cleanEin, status: "ACTIVE" },
        include: NGO_INCLUDES,
      }).catch(() => null),
    ]);
  } else {
    // Internal ID lookup: used by seeded/registered NGO links throughout the platform
    ngo = await prisma.ngo.findUnique({
      where: { id: rawEin },
      include: NGO_INCLUDES,
    }).catch(() => null);

    // If the NGO has an EIN on file, also fetch IRS data
    if (ngo?.ein) {
      irsOrg = await fetchIrsOrg(ngo.ein.replace(/-/g, "")).catch(() => null);
    }
  }

  // If local DB returned nothing for an EIN lookup, try ProPublica before giving up
  let proPublicaData: {
    name?: string; city?: string; state?: string;
    revenue?: number; assets?: number; subsection?: number; ntee?: string;
    filings: { year: number; revenue?: number; expenses?: number; assets?: number }[];
  } | null = null;

  if (!irsOrg && !ngo && isEin) {
    try {
      const res = await fetch(
        `https://projects.propublica.org/nonprofits/api/v2/organizations/${cleanEin}.json`,
        { next: { revalidate: 3600 } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.organization?.name) {
          const filings: { tax_prd_yr: number; totrevenue?: number; totfuncexpns?: number; totassetsend?: number }[] =
            data?.filings_with_data ?? [];
          proPublicaData = {
            name: data.organization.name,
            city: data.organization.city,
            state: data.organization.state,
            revenue: data.organization.revenue_amount,
            assets: data.organization.asset_amount,
            subsection: data.organization.subsection_code,
            ntee: data.organization.ntee_code,
            filings: filings.slice(-5).map((f) => ({
              year: f.tax_prd_yr, revenue: f.totrevenue,
              expenses: f.totfuncexpns, assets: f.totassetsend,
            })),
          };
        }
      }
    } catch { /* ProPublica unavailable */ }
  }

  // Need at least one data source to render
  if (!irsOrg && !ngo && !proPublicaData) notFound();

  // Canonical EIN for links (prefer IRS org EIN, fall back to ngo.ein, then the raw param if it's an EIN)
  const canonicalEin = irsOrg?.ein ?? ngo?.ein?.replace(/-/g, "") ?? (isEin ? cleanEin : null);

  // Use ProPublica data for name/location when local DB has nothing
  const proPublicaName = proPublicaData?.name ?? "";

  // Canonical name + location: prefer IRS, then GiveLedger, then ProPublica
  const orgName = irsOrg?.name ?? ngo?.orgName ?? proPublicaName;
  const orgCity = irsOrg?.city ?? proPublicaData?.city ?? null;
  const orgState = irsOrg?.state ?? ngo?.state ?? proPublicaData?.state ?? null;

  // ── IRS financial data ────────────────────────────────────────────────────
  let irsData: {
    revenue?: number; expenses?: number; assets?: number; liabilities?: number;
    netAssets?: number; taxYear?: number; returnType?: string;
    contributions?: number; programServiceRevenue?: number; investmentIncome?: number;
    salariesAndWages?: number; compensationOfficers?: number; otherExpenses?: number;
    officerCompPct?: number; employeeCount?: number; volunteerCount?: number;
    filings: { year: number; revenue?: number; expenses?: number; assets?: number }[];
    nteeCode?: string; subsection?: number; deductibility?: number;
    ruling?: string; taxPeriod?: string;
    pdfUrl?: string; formType?: string;
    source: "local" | "propublica";
  } | null = null;

  if (irsOrg) {
    // Build from local DB (already fetched above)
    const f = irsOrg.filings[irsOrg.filings.length - 1];
    irsData = {
      revenue: f?.totalRevenue ? Number(f.totalRevenue) : irsOrg.revenueAmount ? Number(irsOrg.revenueAmount) : undefined,
      expenses: f?.totalExpenses ? Number(f.totalExpenses) : undefined,
      assets: f?.totalAssetsEOY ? Number(f.totalAssetsEOY) : irsOrg.assetAmount ? Number(irsOrg.assetAmount) : undefined,
      liabilities: f?.totalLiabilitiesEOY ? Number(f.totalLiabilitiesEOY) : undefined,
      netAssets: f?.netAssetsEOY ? Number(f.netAssetsEOY) : undefined,
      taxYear: f?.taxYear ?? undefined,
      returnType: f?.returnType ?? undefined,
      contributions: f?.contributionsAndGrants ? Number(f.contributionsAndGrants) : undefined,
      programServiceRevenue: f?.programServiceRevenue ? Number(f.programServiceRevenue) : undefined,
      investmentIncome: f?.investmentIncome ? Number(f.investmentIncome) : undefined,
      salariesAndWages: f?.salariesAndWages ? Number(f.salariesAndWages) : undefined,
      compensationOfficers: f?.compensationOfficers ? Number(f.compensationOfficers) : undefined,
      otherExpenses: f?.otherExpenses ? Number(f.otherExpenses) : undefined,
      officerCompPct: f?.pctOfficerCompensation ?? undefined,
      employeeCount: f?.employeeCount ?? undefined,
      volunteerCount: f?.volunteerCount ?? undefined,
      filings: irsOrg.filings.map((filing) => ({
        year: filing.taxYear,
        revenue: filing.totalRevenue ? Number(filing.totalRevenue) : undefined,
        expenses: filing.totalExpenses ? Number(filing.totalExpenses) : undefined,
        assets: filing.totalAssetsEOY ? Number(filing.totalAssetsEOY) : undefined,
      })),
      nteeCode: irsOrg.nteeCode ?? undefined,
      subsection: irsOrg.subsection ?? undefined,
      deductibility: irsOrg.deductibility ?? undefined,
      ruling: irsOrg.ruling ?? undefined,
      taxPeriod: irsOrg.taxPeriod ?? undefined,
      source: "local",
    };
  } else if (proPublicaData) {
    // Use the ProPublica data already fetched above (DB was unavailable)
    irsData = {
      revenue: proPublicaData.revenue,
      assets: proPublicaData.assets,
      filings: proPublicaData.filings,
      nteeCode: proPublicaData.ntee,
      subsection: proPublicaData.subsection,
      source: "propublica",
    };
  } else if (!irsOrg && isEin) {
    // irsOrg was null but proPublicaData was also null (ProPublica fallback already attempted above)
    // Nothing more to try
  }

  // GiveLedger platform stats (only when NGO has registered on platform)
  const totalRaised = ngo?.projects.reduce((sum, p) => sum + p.raisedAmount, 0) ?? 0;
  const totalGoal = ngo?.projects.reduce((sum, p) => sum + p.goalAmount, 0) ?? 0;
  const completedMilestones = ngo?.projects.reduce(
    (sum, p) => sum + p.milestones.filter((m) => m.status === "COMPLETED").length, 0
  ) ?? 0;
  const uniqueDonors = new Set(ngo?.projects.flatMap((p) => p.donations.map((d) => d.userId)) ?? []).size;
  const avgRating = ngo && ngo.ratings.length > 0
    ? ngo.ratings.reduce((sum, r) => sum + r.stars, 0) / ngo.ratings.length
    : null;
  const founders = ngo?.boardMembers.filter((m) => m.memberType === "FOUNDER") ?? [];
  const boardOnly = ngo?.boardMembers.filter((m) => m.memberType !== "FOUNDER") ?? [];
  const galleryDocs = ngo?.documents.filter((d) => d.category === "GALLERY") ?? [];
  const otherDocs = ngo?.documents.filter((d) => d.category !== "GALLERY") ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 pt-5 sm:px-6 lg:px-8">
        <Link href="/ngos" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Nonprofits
        </Link>
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 mt-4">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-start gap-6">
            {ngo?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ngo.logoUrl} alt={orgName}
                className="w-20 h-20 rounded-xl object-cover border border-gray-100 bg-gray-50 shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold text-emerald-700">{orgName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{orgName}</h1>
                {ngo && <Badge className="bg-emerald-100 text-emerald-800 text-xs">On GiveLedger</Badge>}
                {irsData?.subsection === 3 && <Badge className="bg-blue-50 text-blue-700 text-xs">501(c)(3)</Badge>}
              </div>
              {(orgCity || orgState) && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {[orgCity, orgState].filter(Boolean).join(", ")}, United States
                </p>
              )}
              {ngo?.description && <p className="text-sm text-gray-600 max-w-2xl">{ngo.description}</p>}
              {ngo?.aiSummary && !ngo.description && (
                <div className="max-w-2xl">
                  <p className="text-sm text-gray-600">{ngo.aiSummary}</p>
                  <p className="text-xs text-violet-500 flex items-center gap-1 mt-1">
                    <Sparkles className="w-3 h-3" /> AI-generated summary
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-4 mt-3">
                {ngo?.website && (
                  <a href={ngo.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:underline">
                    <Globe className="w-3.5 h-3.5" />
                    {ngo.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {canonicalEin && <span className="text-xs text-gray-400">EIN: {canonicalEin}</span>}
                {irsData?.ruling && (
                  <span className="text-xs text-gray-400">
                    501(c)(3) since {formatRulingDate(irsData.ruling)}
                  </span>
                )}
                {avgRating !== null && (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {avgRating.toFixed(1)} ({ngo!.ratings.length} review{ngo!.ratings.length !== 1 ? "s" : ""})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* GiveLedger platform stats — only shown when registered */}
        {ngo && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Raised", value: formatCurrency(totalRaised), sub: `of ${formatCurrency(totalGoal)} goal` },
              { label: "Active Projects", value: ngo.projects.length.toString(), sub: "currently running" },
              { label: "Milestones Completed", value: completedMilestones.toString(), sub: "verified on-chain" },
              { label: "Donors", value: uniqueDonors.toString(), sub: "unique supporters" },
            ].map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-5 pb-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs font-medium text-gray-600 mt-0.5">{stat.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* IRS Financial Overview — shown when EIN is on file */}
        {irsData && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">IRS Financial Data</h2>
                {irsData.taxYear && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {irsData.taxYear} filing
                  </span>
                )}
                {(irsData.returnType || irsData.formType) && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                    Form {irsData.returnType ?? irsData.formType}
                  </span>
                )}
              </div>
              {canonicalEin && (
                <Link
                  href={`/irs-directory/${canonicalEin}`}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 shrink-0"
                >
                  Full IRS profile <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Key financial metrics — 2×2 grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Revenue", value: irsData.revenue, icon: <DollarSign className="w-4 h-4 text-emerald-500" />, color: "bg-emerald-50" },
                { label: "Total Expenses", value: irsData.expenses, icon: <TrendingUp className="w-4 h-4 text-amber-500" />, color: "bg-amber-50" },
                { label: "Net Assets", value: irsData.netAssets ?? (irsData.assets != null && irsData.liabilities != null ? irsData.assets - irsData.liabilities : irsData.assets), icon: <Landmark className="w-4 h-4 text-blue-500" />, color: "bg-blue-50" },
                { label: "Total Liabilities", value: irsData.liabilities, icon: <BarChart3 className="w-4 h-4 text-red-400" />, color: "bg-red-50" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className={`${color} rounded-xl p-3 text-center`}>
                  <div className="flex justify-center mb-1">{icon}</div>
                  <p className="text-base font-bold text-gray-900">{formatIrsDollars(value)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Revenue breakdown */}
            {(irsData.contributions != null || irsData.programServiceRevenue != null) && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Revenue Breakdown</p>
                <div className="space-y-2">
                  {[
                    { label: "Contributions & Grants", value: irsData.contributions, color: "bg-emerald-400" },
                    { label: "Program Service Revenue", value: irsData.programServiceRevenue, color: "bg-blue-400" },
                    { label: "Investment Income", value: irsData.investmentIncome, color: "bg-violet-400" },
                  ].filter(r => r.value != null && r.value > 0).map((row) => {
                    const total = irsData!.revenue ?? 1;
                    const pct = Math.round((row.value! / total) * 100);
                    return (
                      <div key={row.label} className="flex items-center gap-3">
                        <p className="text-xs text-gray-600 w-44 shrink-0">{row.label}</p>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className={`${row.color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs font-medium text-gray-700 w-16 text-right">{formatIrsDollars(row.value)}</p>
                        <p className="text-xs text-gray-400 w-8 text-right">{pct}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Expense breakdown */}
            {(irsData.salariesAndWages != null || irsData.compensationOfficers != null) && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Expense Breakdown</p>
                <div className="space-y-2">
                  {[
                    { label: "Salaries & Wages", value: irsData.salariesAndWages, color: "bg-amber-400" },
                    { label: "Officer Compensation", value: irsData.compensationOfficers, color: "bg-orange-400" },
                    { label: "Other Expenses", value: irsData.otherExpenses, color: "bg-gray-400" },
                  ].filter(r => r.value != null && r.value > 0).map((row) => {
                    const total = irsData!.expenses ?? 1;
                    const pct = Math.round((row.value! / total) * 100);
                    return (
                      <div key={row.label} className="flex items-center gap-3">
                        <p className="text-xs text-gray-600 w-44 shrink-0">{row.label}</p>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className={`${row.color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs font-medium text-gray-700 w-16 text-right">{formatIrsDollars(row.value)}</p>
                        <p className="text-xs text-gray-400 w-8 text-right">{pct}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Workforce & Compensation */}
            {(irsData.employeeCount != null || irsData.volunteerCount != null || irsData.officerCompPct != null) && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Workforce</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {irsData.employeeCount != null && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-gray-900">{irsData.employeeCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Employees</p>
                    </div>
                  )}
                  {irsData.volunteerCount != null && irsData.volunteerCount > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-gray-900">{irsData.volunteerCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Volunteers</p>
                    </div>
                  )}
                  {irsData.officerCompPct != null && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-gray-900">{irsData.officerCompPct.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 mt-0.5">Officer Comp of Expenses</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Revenue trend chart */}
            {irsData.filings.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Revenue vs Expenses Trend</p>
                <div className="flex items-end gap-2 h-20">
                  {irsData.filings.map((f) => {
                    const maxVal = Math.max(...irsData!.filings.flatMap((x) => [x.revenue ?? 0, x.expenses ?? 0]));
                    const revPct = maxVal > 0 ? Math.round(((f.revenue ?? 0) / maxVal) * 100) : 0;
                    const expPct = maxVal > 0 ? Math.round(((f.expenses ?? 0) / maxVal) * 100) : 0;
                    return (
                      <div key={f.year} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-0.5 items-end" style={{ height: "60px" }}>
                          <div className="flex-1 bg-blue-200 rounded-sm flex items-end">
                            <div className="w-full bg-blue-500 rounded-sm" style={{ height: `${Math.max(2, revPct * 0.6)}px` }} />
                          </div>
                          <div className="flex-1 bg-amber-200 rounded-sm flex items-end">
                            <div className="w-full bg-amber-400 rounded-sm" style={{ height: `${Math.max(2, expPct * 0.6)}px` }} />
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400">{f.year}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" /> Revenue</span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" /> Expenses</span>
                </div>
              </div>
            )}

            {/* Org classification */}
            {(irsData.nteeCode || irsData.subsection != null || irsData.deductibility != null || irsData.ruling) && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">IRS Classification</p>
                <div className="flex flex-wrap gap-2">
                  {irsData.subsection != null && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      501(c)({irsData.subsection})
                    </span>
                  )}
                  {irsData.nteeCode && (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                      NTEE: {irsData.nteeCode} · {nteeCategory(irsData.nteeCode)}
                    </span>
                  )}
                  {irsData.deductibility === 1 && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      ✓ Donations tax-deductible
                    </span>
                  )}
                  {irsData.ruling && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      501(c)(3) since {formatRulingDate(irsData.ruling)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {irsData.source === "local" ? (
                  "Source: IRS Business Master File (GiveLedger)"
                ) : (
                  <>Source: IRS Form 990 via{" "}
                    <a href="https://projects.propublica.org/nonprofits/" target="_blank" rel="noopener noreferrer" className="underline">ProPublica</a>
                  </>
                )}
              </p>
              {irsData.pdfUrl && (
                <a href={irsData.pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  View Form 990 <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Active Projects */}
            {ngo && ngo.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" /> Active Projects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ngo.projects.map((p) => {
                    const pct = Math.min(100, Math.round((p.raisedAmount / p.goalAmount) * 100));
                    const completedCount = p.milestones.filter((m) => m.status === "COMPLETED").length;
                    const donors = new Set(p.donations.map((d) => d.userId)).size;
                    return (
                      <Link key={p.id} href={`/projects/${p.id}`} className="block group">
                        <div className="p-4 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{categoryEmoji[p.category] ?? "🌱"}</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700">{p.title}</p>
                                <p className="text-xs text-gray-500">{categoryLabel[p.category] ?? p.category}</p>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 mt-0.5 shrink-0" />
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatCurrency(p.raisedAmount)} raised ({pct}%)</span>
                            <span>{completedCount}/{p.milestones.length} milestones · {donors} donors</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Founders */}
            {founders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600" /> Founders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {founders.map((m) => <MemberCard key={m.id} member={m} />)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Board Members */}
            {boardOnly.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" /> Board &amp; Leadership
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {boardOnly.map((m) => <MemberCard key={m.id} member={m} />)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {galleryDocs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-600" /> Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {galleryDocs.map((doc) => (
                      <a
                        key={doc.id}
                        href={`/api/ngo/documents/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg border border-gray-100 overflow-hidden hover:border-emerald-200 transition-colors group"
                      >
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-emerald-400" />
                        </div>
                        {doc.caption && (
                          <p className="text-xs text-gray-500 px-2 py-1.5 truncate">{doc.caption}</p>
                        )}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Other Documents */}
            {otherDocs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" /> Documents &amp; Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {otherDocs.map((doc) => (
                      <a
                        key={doc.id}
                        href={`/api/ngo/documents/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors group"
                      >
                        <FileText className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate group-hover:text-emerald-700">{doc.fileName}</p>
                          <p className="text-xs text-gray-400">
                            {docCategoryLabel[doc.category] ?? doc.category}
                            {doc.caption ? ` · ${doc.caption}` : ""}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 shrink-0" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* IRS / Platform verification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  canonicalEin ? { label: `EIN: ${canonicalEin}`, icon: "🆔" } : null,
                  irsData?.subsection === 3 ? { label: "501(c)(3) Non-Profit", icon: "📋" } : null,
                  irsData?.deductibility === 1 ? { label: "Tax-deductible donations", icon: "✅" } : null,
                  ngo ? { label: "GiveLedger verified", icon: "🟢" } : null,
                  ngo ? { label: "Milestone-locked funding", icon: "🔒" } : null,
                  ngo ? { label: "On-chain disbursements", icon: "⛓️" } : null,
                  ngo?.regNumber ? { label: `Reg: ${ngo.regNumber}`, icon: "📄" } : null,
                ].filter(Boolean).map((item) => (
                  <div key={item!.label} className="flex items-center gap-2 text-sm text-gray-700">
                    <span>{item!.icon}</span>
                    <span>{item!.label}</span>
                  </div>
                ))}
                {ngo && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">GiveLedger Trust Score</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, ngo.trustScore)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">
                        {ngo.trustScore.toFixed(0)}/100
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donor reviews — only when on platform */}
            {ngo && ngo.ratings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" /> Donor Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ngo.ratings.slice(0, 3).map((r) => (
                    <div key={r.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/donor/${r.donor.id}/profile`}
                          className="text-xs font-medium text-gray-700 hover:text-emerald-700 hover:underline transition-colors"
                        >
                          {r.donor.name ?? "Anonymous"}
                        </Link>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < r.stars ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-xs text-gray-500 line-clamp-2">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* CTA — differs based on platform presence */}
            {ngo ? (
              <div className="bg-emerald-50 rounded-xl p-4 text-center space-y-3">
                <p className="text-sm font-semibold text-emerald-800">Support this NGO</p>
                <p className="text-xs text-emerald-700">
                  Every donation is milestone-locked and recorded on-chain.
                </p>
                {ngo.projects.length > 0 && (
                  <Link
                    href={`/projects/${ngo.projects[0].id}`}
                    className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    View Projects
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center space-y-3">
                <Building2 className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-amber-800">Is this your organisation?</p>
                <p className="text-xs text-amber-700">
                  Claim this profile to start receiving milestone-locked donations and build your GiveLedger trust score.
                </p>
                <Link
                  href="/signup?role=ngo"
                  className="inline-flex items-center justify-center w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Claim this profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberCard({ member }: {
  member: {
    id: string; name: string; role: string; memberType: string;
    bio: string | null; linkedinUrl: string | null; photoUrl: string | null;
  };
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
      {member.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.photoUrl} alt={member.name} className="w-12 h-12 rounded-full object-cover shrink-0 bg-gray-200" />
      ) : (
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <span className="text-base font-bold text-emerald-700">{member.name.charAt(0).toUpperCase()}</span>
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-gray-900">{member.name}</p>
          {member.memberType === "FOUNDER" && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Founder</span>
          )}
        </div>
        <p className="text-xs font-medium text-emerald-700">{member.role}</p>
        {member.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{member.bio}</p>}
        {member.linkedinUrl && (
          <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5">
            <Linkedin className="w-3 h-3" /> LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}
