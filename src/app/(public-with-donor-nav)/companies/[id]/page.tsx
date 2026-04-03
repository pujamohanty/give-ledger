import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import CompanySuggestedRolesSection from "./CompanySuggestedRolesSection";
import type { OutreachTarget, OutreachCandidate, ExistingOutreach } from "@/components/OutreachDrawer";
import {
  Building2, MapPin, Globe, BadgeCheck, Users,
  Calendar, ChevronLeft, Briefcase, Award, Mail,
} from "lucide-react";

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

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const [company, candidateUser, existingContact] = await Promise.all([
    prisma.company.findUnique({
      where: { id },
      include: {
        suggestedRoles: {
          where: { expiresAt: { gt: new Date() } },
          orderBy: [{ isAiAugmented: "asc" }, { generatedAt: "desc" }],
        },
      },
    }),
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { id: true, name: true, jobTitle: true },
        })
      : null,
    session?.user?.id
      ? prisma.outreachContact.findFirst({
          where: { userId: session.user.id, companyId: id },
          select: { id: true, status: true, sentAt: true, roleTitleRef: true },
        })
      : null,
  ]);

  if (!company) notFound();

  const displayName = company.dbaName ?? company.legalName;

  const outreachTarget: OutreachTarget = {
    name: displayName,
    type: "company",
    id: company.id,
    contactEmail: company.contactEmail,
    contactName: company.contactName,
    sector: company.naicsDescription ?? "",
    roleTitles: company.suggestedRoles.map((r) => r.title),
  };
  const outreachCandidate: OutreachCandidate | null = candidateUser
    ? {
        name: candidateUser.name ?? "You",
        jobTitle: candidateUser.jobTitle,
        credentialUserId: candidateUser.id,
      }
    : null;
  const existingOutreach: ExistingOutreach = existingContact
    ? {
        id: existingContact.id,
        status: existingContact.status,
        sentAt: existingContact.sentAt.toISOString(),
        roleTitleRef: existingContact.roleTitleRef,
      }
    : null;
  const location = [
    company.city,
    company.state ? (STATE_LABELS[company.state] ?? company.state) : null,
  ].filter(Boolean).join(", ");

  const address = [
    company.streetAddress,
    company.city,
    company.state,
    company.zipCode,
  ].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All Companies
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{displayName}</h1>
              {company.dbaName && company.legalName !== company.dbaName && (
                <p className="text-xs text-gray-400 mt-0.5">Legal name: {company.legalName}</p>
              )}
              {location && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {location}
                </p>
              )}
              {company.naicsDescription && (
                <p className="text-sm text-gray-600 mt-1">{company.naicsDescription}</p>
              )}
            </div>

            {company.website && (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Website
              </a>
            )}
          </div>

          {/* Verification badges */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
            {company.samRegistered && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" /> SAM.gov Registered
              </span>
            )}
            {company.ocRegistered && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5" /> State Incorporated
              </span>
            )}
            {company.sbaDesignations.map((d) => (
              <span key={d} className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full">
                <Award className="w-3 h-3" />
                {d.replace("Small Business", "").replace("Certified", "").trim()}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main column — AI roles */}
          <div className="lg:col-span-2">
            <CompanySuggestedRolesSection
              companyId={company.id}
              initialRoles={company.suggestedRoles}
              outreach={{
                targetBase: {
                  name: outreachTarget.name,
                  type: outreachTarget.type,
                  id: outreachTarget.id,
                  contactEmail: outreachTarget.contactEmail,
                  contactName: outreachTarget.contactName,
                  sector: outreachTarget.sector,
                },
                candidate: outreachCandidate,
                existing: existingOutreach,
              }}
            />

            {/* Credential CTA */}
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-violet-950 to-indigo-950 border border-violet-800/40 p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4.5 h-4.5 text-violet-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">
                    Apply with your GiveLedger credential
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3">
                    Your verified contribution record — donations, skills, endorsements — is proof of real-world impact.
                    Companies hiring for AI-augmented roles value this over traditional CVs.
                  </p>
                  <Link
                    href="/donor/credential"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View my credential →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — company info */}
          <div className="space-y-4">
            {/* Business details */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Company Details</h3>
              <div className="space-y-2.5 text-sm">
                {company.entityStructure && (
                  <div className="flex items-start gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{company.entityStructure}</span>
                  </div>
                )}
                {company.businessTypes.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{company.businessTypes[0]}</span>
                  </div>
                )}
                {company.employeeRange && (
                  <div className="flex items-start gap-2">
                    <Users className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-gray-700">{company.employeeRange} employees</span>
                  </div>
                )}
                {company.registrationDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      SAM registered {new Date(company.registrationDate).getFullYear()}
                    </span>
                  </div>
                )}
                {company.incorporationDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-gray-700">
                      Incorporated {new Date(company.incorporationDate).getFullYear()}
                    </span>
                  </div>
                )}
                {address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-gray-700 text-xs">{address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            {(company.contactName || company.contactEmail) && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact</h3>
                <div className="space-y-2 text-sm">
                  {company.contactName && (
                    <p className="text-gray-700 font-medium">{company.contactName}</p>
                  )}
                  {company.contactEmail && (
                    <a
                      href={`mailto:${company.contactEmail}`}
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {company.contactEmail}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* NAICS codes */}
            {company.naicsCodes.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">NAICS Codes</h3>
                <div className="flex flex-wrap gap-1.5">
                  {company.naicsCodes.slice(0, 8).map((code) => (
                    <Link
                      key={code}
                      href={`/companies?naics=${code.slice(0, 4)}`}
                      className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {code}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Data sources */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Data Sources</h3>
              <div className="space-y-1">
                {company.samRegistered && (
                  <p className="text-[10px] text-gray-400">SAM.gov — Entity Management API</p>
                )}
                {company.ocRegistered && (
                  <p className="text-[10px] text-gray-400">OpenCorporates — State Registry</p>
                )}
                {company.uei && (
                  <p className="text-[10px] text-gray-400 font-mono">UEI: {company.uei}</p>
                )}
                {company.cageCode && (
                  <p className="text-[10px] text-gray-400 font-mono">CAGE: {company.cageCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
