import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, DollarSign, ExternalLink, Landmark, MapPin, Shield, Users } from "lucide-react";
import { getNteeCategory, getSubsectionLabel, formatEin, formatDollars } from "@/lib/ntee-codes";
import IrsOrgCharts from "./IrsOrgCharts";

export async function generateMetadata(
  { params }: { params: Promise<{ ein: string }> }
): Promise<Metadata> {
  const { ein } = await params;
  const cleanEin = ein.replace(/-/g, "").padStart(9, "0");
  const org = await prisma.irsOrganization.findUnique({
    where: { ein: cleanEin },
    select: { name: true },
  });
  return {
    title: org ? `${org.name} — GiveLedger` : "Organization Not Found",
    description: org ? `IRS tax-exempt organization ${formatEin(cleanEin)} — financial data, filings, and more.` : undefined,
  };
}

export default async function IrsOrgDetailPage({
  params,
}: {
  params: Promise<{ ein: string }>;
}) {
  const { ein } = await params;
  const cleanEin = ein.replace(/-/g, "").padStart(9, "0");
  const session = await auth();

  const org = await prisma.irsOrganization.findUnique({
    where: { ein: cleanEin },
    include: {
      filings: { orderBy: { taxYear: "asc" } },
      ngo: {
        select: { id: true, orgName: true, status: true, trustScore: true, logoUrl: true },
      },
    },
  });

  if (!org) notFound();

  const latestFiling = org.filings[org.filings.length - 1];
  const nteeCategory = getNteeCategory(org.nteeCode);
  const subsectionLabel = getSubsectionLabel(org.subsection);

  // Serialize filings for the client chart component
  const filingsForCharts = org.filings.map((f) => ({
    taxYear: f.taxYear,
    totalRevenue: f.totalRevenue ? Number(f.totalRevenue) : null,
    totalExpenses: f.totalExpenses ? Number(f.totalExpenses) : null,
    totalAssetsEOY: f.totalAssetsEOY ? Number(f.totalAssetsEOY) : null,
    totalLiabilitiesEOY: f.totalLiabilitiesEOY ? Number(f.totalLiabilitiesEOY) : null,
    netAssetsEOY: f.netAssetsEOY ? Number(f.netAssetsEOY) : null,
    compensationOfficers: f.compensationOfficers ? Number(f.compensationOfficers) : null,
    pctOfficerCompensation: f.pctOfficerCompensation,
    employeeCount: f.employeeCount,
    volunteerCount: f.volunteerCount,
    contributionsAndGrants: f.contributionsAndGrants ? Number(f.contributionsAndGrants) : null,
    programServiceRevenue: f.programServiceRevenue ? Number(f.programServiceRevenue) : null,
    returnType: f.returnType,
  }));

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />

      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6">
        {/* Back link */}
        <Link href="/irs-directory" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> All Organizations
        </Link>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-bold text-xl shrink-0`}>
              {org.name.trim().split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{org.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {(org.city || org.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {[org.city, org.state].filter(Boolean).join(", ")} {org.zip}
                  </span>
                )}
                <span className="font-mono text-gray-400">EIN: {formatEin(org.ein)}</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  {subsectionLabel}
                </span>
                <span className="text-xs font-semibold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full">
                  {nteeCategory}
                </span>
                {org.nteeCode && (
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                    NTEE: {org.nteeCode}
                  </span>
                )}
                {org.deductibility === 1 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Tax Deductible
                  </span>
                )}
                {org.ngo && (
                  <Link href={`/ngo/${org.ngo.id}`}
                    className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-amber-100 transition">
                    <Shield className="w-3 h-3" /> Active on GiveLedger
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Revenue"
            value={formatDollars(latestFiling?.totalRevenue ?? org.revenueAmount)}
            sub={latestFiling ? `FY ${latestFiling.taxYear}` : "BMF"}
            icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          />
          <StatCard
            label="Total Assets"
            value={formatDollars(latestFiling?.totalAssetsEOY ?? org.assetAmount)}
            sub={latestFiling ? `FY ${latestFiling.taxYear}` : "BMF"}
            icon={<Landmark className="w-5 h-5 text-blue-500" />}
          />
          <StatCard
            label="Filings"
            value={String(org.filings.length)}
            sub={org.filings.length > 0 ? `${org.filings[0].taxYear}–${org.filings[org.filings.length - 1].taxYear}` : "None"}
            icon={<Calendar className="w-5 h-5 text-violet-500" />}
          />
          <StatCard
            label="Employees"
            value={latestFiling?.employeeCount?.toLocaleString() ?? "N/A"}
            sub={latestFiling?.volunteerCount ? `${latestFiling.volunteerCount.toLocaleString()} volunteers` : ""}
            icon={<Users className="w-5 h-5 text-amber-500" />}
          />
        </div>

        {/* Financial charts */}
        {filingsForCharts.length > 0 ? (
          <IrsOrgCharts filings={filingsForCharts} orgName={org.name} />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No financial filings available for this organization.</p>
            <p className="text-xs mt-1">Financial data comes from IRS Form 990 filings.</p>
          </div>
        )}

        {/* Organization details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Organization Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <DetailRow label="EIN" value={formatEin(org.ein)} />
            <DetailRow label="Classification" value={subsectionLabel} />
            <DetailRow label="NTEE Code" value={org.nteeCode ? `${org.nteeCode} — ${nteeCategory}` : "N/A"} />
            <DetailRow label="Ruling Date" value={org.ruling ? `${org.ruling.slice(0, 4)}-${org.ruling.slice(4)}` : "N/A"} />
            <DetailRow label="Foundation Type" value={org.foundation !== null ? String(org.foundation) : "N/A"} />
            <DetailRow label="Accounting Period" value={org.accountingPeriod ? `Month ${org.accountingPeriod}` : "N/A"} />
            {org.street && <DetailRow label="Address" value={`${org.street}, ${org.city}, ${org.state} ${org.zip}`} />}
            {org.ico && <DetailRow label="In Care Of" value={org.ico} />}
            {org.groupNumber && org.groupNumber !== "0000" && (
              <DetailRow label="Group Exemption" value={org.groupNumber} />
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-400 text-xs font-medium">{label}</dt>
      <dd className="text-gray-900 font-medium">{value}</dd>
    </div>
  );
}
