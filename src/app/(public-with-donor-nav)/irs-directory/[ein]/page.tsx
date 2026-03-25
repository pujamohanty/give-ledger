import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, DollarSign, ExternalLink, Landmark, MapPin, Shield, Users } from "lucide-react";
import { getNteeCategory, getSubsectionLabel, formatEin, formatDollars } from "@/lib/ntee-codes";
import IrsOrgCharts from "./IrsOrgCharts";

interface ProPublicaOrg {
  ein: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  subsection_code?: number;
  ntee_code?: string;
  deductibility_code?: number;
  asset_amount?: number;
  income_amount?: number;
  revenue_amount?: number;
  ruling_date?: string;
  tax_period?: string;
  have_pdfs?: boolean;
  latest_filing?: { tax_prd_yr?: number; formtype?: string; pdf_url?: string };
}

interface ProPublicaFiling {
  tax_prd_yr: number;
  formtype?: string;
  totrevenue?: number;
  totfuncexpns?: number;
  totassetsend?: number;
  totliabend?: number;
  pct_compnsatncurrofcr?: number;
  noemployes?: number;
}

export async function generateMetadata(
  { params }: { params: Promise<{ ein: string }> }
): Promise<Metadata> {
  const { ein } = await params;
  const cleanEin = ein.replace(/-/g, "");
  try {
    const res = await fetch(
      `https://projects.propublica.org/nonprofits/api/v2/organizations/${cleanEin}.json`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const name = data?.organization?.name;
    return {
      title: name ? `${name} — GiveLedger` : "Organization Not Found",
    };
  } catch {
    return { title: "Organization — GiveLedger" };
  }
}

export default async function IrsOrgDetailPage({
  params,
}: {
  params: Promise<{ ein: string }>;
}) {
  const { ein } = await params;
  const cleanEin = ein.replace(/-/g, "");
  const session = await auth();

  let org: ProPublicaOrg | null = null;
  let filings: ProPublicaFiling[] = [];

  try {
    const res = await fetch(
      `https://projects.propublica.org/nonprofits/api/v2/organizations/${cleanEin}.json`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      org = data?.organization ?? null;
      filings = data?.filings_with_data ?? [];
    }
  } catch {
    /* show not found */
  }

  if (!org) notFound();

  // Check if this EIN is claimed by a GiveLedger NGO
  const linkedNgo = await prisma.ngo.findFirst({
    where: { ein: cleanEin },
    select: { id: true, orgName: true, status: true, trustScore: true, logoUrl: true },
  });

  const nteeCategory = getNteeCategory(org.ntee_code);
  const subsectionLabel = getSubsectionLabel(org.subsection_code);
  const latestFiling = filings[filings.length - 1];

  const filingsForCharts = filings.map((f) => ({
    taxYear: f.tax_prd_yr,
    totalRevenue: f.totrevenue ?? null,
    totalExpenses: f.totfuncexpns ?? null,
    totalAssetsEOY: f.totassetsend ?? null,
    totalLiabilitiesEOY: f.totliabend ?? null,
    netAssetsEOY: f.totassetsend != null && f.totliabend != null ? f.totassetsend - f.totliabend : null,
    compensationOfficers: null,
    pctOfficerCompensation: f.pct_compnsatncurrofcr ?? null,
    employeeCount: f.noemployes ?? null,
    volunteerCount: null,
    contributionsAndGrants: null,
    programServiceRevenue: null,
    returnType: f.formtype ?? null,
  }));

  function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1 text-gray-400">{icon}</div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />

      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6">
        <Link href="/irs-directory" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> All Organizations
        </Link>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {org.name.trim().split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{org.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {(org.city || org.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {[org.city, org.state].filter(Boolean).join(", ")} {org.zipcode}
                  </span>
                )}
                <span className="font-mono text-gray-400">EIN: {formatEin(cleanEin)}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">{subsectionLabel}</span>
                <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full">{nteeCategory}</span>
                {org.ntee_code && (
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">NTEE: {org.ntee_code}</span>
                )}
                {org.deductibility_code === 1 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Tax Deductible
                  </span>
                )}
                {linkedNgo && (
                  <Link href={`/ngo/${linkedNgo.id}`}
                    className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-amber-100 transition">
                    <Shield className="w-3 h-3" /> Active on GiveLedger
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Latest Revenue" value={formatDollars(latestFiling?.totrevenue ?? org.revenue_amount)} icon={<DollarSign className="w-4 h-4" />} />
          <StatCard label="Total Assets" value={formatDollars(latestFiling?.totassetsend ?? org.asset_amount)} icon={<Landmark className="w-4 h-4" />} />
          <StatCard label="Tax Year" value={latestFiling?.tax_prd_yr?.toString() ?? "—"} icon={<Calendar className="w-4 h-4" />} />
          <StatCard label="Form Type" value={latestFiling?.formtype ?? org.latest_filing?.formtype ?? "—"} icon={<Building2 className="w-4 h-4" />} />
        </div>

        {/* Charts */}
        {filingsForCharts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Financial History</h2>
            <IrsOrgCharts filings={filingsForCharts} orgName={org.name} />
          </div>
        )}

        {/* Latest 990 PDF */}
        {org.latest_filing?.pdf_url && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Latest Form 990</p>
              <p className="text-xs text-gray-500">
                {org.latest_filing.tax_prd_yr} · {org.latest_filing.formtype}
              </p>
            </div>
            <a href={org.latest_filing.pdf_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
              View PDF <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Data source */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Financial data sourced from{" "}
          <a href="https://projects.propublica.org/nonprofits/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
            ProPublica Nonprofit Explorer
          </a>{" "}
          · IRS Form 990 filings
        </p>
      </div>
    </div>
  );
}
