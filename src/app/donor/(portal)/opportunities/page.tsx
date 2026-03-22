import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { LogHoursButton } from "@/components/RoleApplicationActions";
import ShareJourneyButton from "@/components/ShareJourneyButton";
import {
  Briefcase, Clock, CheckCircle, XCircle, Search,
  Star, ChevronRight, Linkedin, FileText, ExternalLink,
} from "lucide-react";


const appStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:   { label: "Under review",  color: "text-amber-700 bg-amber-50 border-amber-100",       icon: Clock },
  ACCEPTED:  { label: "Accepted",      color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: CheckCircle },
  REJECTED:  { label: "Not selected",  color: "text-gray-500 bg-gray-100 border-gray-200",         icon: XCircle },
  WITHDRAWN: { label: "Withdrawn",     color: "text-gray-500 bg-gray-100 border-gray-200",         icon: XCircle },
};

export default async function DonorOpportunitiesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const applications = await prisma.roleApplication.findMany({
    where: { applicantId: session.user.id },
    include: {
      role: {
        include: {
          ngo: { select: { id: true, orgName: true } },
          project: { select: { title: true } },
        },
      },
      engagement: true,
    },
    orderBy: { appliedAt: "desc" },
  });

  const active    = applications.filter((a) => a.status === "ACCEPTED" && a.engagement?.status === "ACTIVE");
  const pending   = applications.filter((a) => a.status === "PENDING");
  const completed = applications.filter((a) => a.engagement?.status === "COMPLETED");
  const other     = applications.filter((a) => a.status !== "PENDING" && a.status !== "ACCEPTED");

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track your role applications and active engagements.
          </p>
        </div>
        <Link href="/opportunities">
          <Button variant="outline" className="gap-2 text-sm">
            <Search className="w-4 h-4" /> Browse roles
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No applications yet</p>
          <p className="text-xs text-gray-400 mb-5">
            Browse open roles from verified NGOs and apply to contribute your skills.
          </p>
          <Link href="/opportunities">
            <Button className="gap-2 text-sm"><Search className="w-4 h-4" /> Browse opportunities</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Active engagements */}
          {active.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Active engagements ({active.length})
              </h2>
              <div className="space-y-3">
                {active.map((app) => (
                  <div key={app.id} className="bg-white border border-emerald-200 rounded-xl overflow-hidden">
                    {/* Role link header */}
                    <Link
                      href={`/opportunities/${app.role.id}`}
                      className="flex items-start justify-between gap-4 p-5 hover:bg-emerald-50 transition-colors group"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{app.role.title}</p>
                          <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <p className="text-xs text-gray-500">{app.role.ngo.orgName}</p>
                        {app.role.project && (
                          <p className="text-[11px] text-emerald-600 mt-0.5">{app.role.project.title}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-gray-900">{app.engagement?.hoursLogged ?? 0}h</p>
                        <p className="text-[11px] text-gray-400">logged</p>
                      </div>
                    </Link>

                    <div className="px-5 pb-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {app.role.timeCommitment}
                          </span>
                          <span>{app.role.durationWeeks} weeks</span>
                          <span>Started {app.engagement?.startedAt
                            ? new Date(app.engagement.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                            : "recently"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShareJourneyButton
                            shareText={`${app.engagement?.hoursLogged ?? 0}h logged and counting. I'm currently volunteering as ${app.role.title} for ${app.role.ngo.orgName} through GiveLedger. Skills matter as much as money.`}
                            sharePath={`/opportunities/${app.role.id}`}
                            buttonLabel="Share update"
                          />
                          {app.engagement && (
                            <LogHoursButton
                              engagementId={app.engagement.id}
                              currentHours={app.engagement.hoursLogged}
                              roleTitle={app.role.title}
                              ngoName={app.role.ngo.orgName}
                            />
                          )}
                        </div>
                      </div>

                      {app.engagement?.workSummary && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-[11px] text-gray-400 mb-1">Latest update</p>
                          <p className="text-xs text-gray-600">{app.engagement.workSummary}</p>
                        </div>
                      )}

                      {/* Your submitted application */}
                      <ApplicationDetails coverNote={app.coverNote} linkedinUrl={app.linkedinUrl} appliedAt={app.appliedAt} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pending applications */}
          {pending.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Pending applications ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((app) => (
                  <div key={app.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {/* Role link header */}
                    <Link
                      href={`/opportunities/${app.role.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700 transition-colors">{app.role.title}</p>
                          <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                        </div>
                        <p className="text-xs text-gray-500">{app.role.ngo.orgName}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] text-gray-400">
                          Applied {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-100">
                          <Clock className="w-2.5 h-2.5" /> Under review
                        </span>
                      </div>
                    </Link>

                    {/* Your submitted application */}
                    <div className="border-t border-gray-100 px-5 py-3">
                      <ApplicationDetails coverNote={app.coverNote} linkedinUrl={app.linkedinUrl} appliedAt={app.appliedAt} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Completed ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map((app) => (
                  <div key={app.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <Link
                      href={`/opportunities/${app.role.id}`}
                      className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 hover:bg-gray-50 transition-colors group"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">{app.role.title}</p>
                          <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <p className="text-xs text-gray-500">{app.role.ngo.orgName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">{app.engagement?.hoursLogged ?? 0}h</p>
                        {app.engagement?.monetaryValue && (
                          <p className="text-[11px] text-emerald-600">${app.engagement.monetaryValue.toLocaleString()} value</p>
                        )}
                      </div>
                    </Link>

                    <div className="px-5 pb-5 space-y-3">
                      {app.engagement?.ngoFeedback && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mb-1">
                            <Star className="w-3 h-3 text-emerald-500" /> NGO endorsement
                          </p>
                          <p className="text-xs text-gray-700 italic">&quot;{app.engagement.ngoFeedback}&quot;</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-gray-400">
                          Completed {app.engagement?.completedAt
                            ? new Date(app.engagement.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : ""}
                        </p>
                        <div className="flex items-center gap-2">
                          <ShareJourneyButton
                            shareText={`I just completed ${app.engagement?.hoursLogged ?? 0} hours as ${app.role.title} for ${app.role.ngo.orgName} — verified on GiveLedger.${app.engagement?.monetaryValue ? ` Equivalent to $${app.engagement.monetaryValue.toLocaleString()} in professional services.` : ""} Proud to have contributed.`}
                            sharePath="/donor/credential"
                            buttonLabel="Share achievement"
                            variant="emerald"
                          />
                          <Link
                            href="/donor/credential"
                            className="text-xs text-emerald-700 font-medium hover:underline flex items-center gap-1"
                          >
                            View on credential <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      <ApplicationDetails coverNote={app.coverNote} linkedinUrl={app.linkedinUrl} appliedAt={app.appliedAt} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Declined / withdrawn */}
          {other.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Past applications
              </h2>
              <div className="space-y-2">
                {other.map((app) => {
                  const statusInfo = appStatusConfig[app.status] ?? appStatusConfig.WITHDRAWN;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div key={app.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <Link
                        href={`/opportunities/${app.role.id}`}
                        className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium text-gray-600 truncate group-hover:text-emerald-700 transition-colors">{app.role.title}</p>
                            <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                          </div>
                          <p className="text-[11px] text-gray-400">{app.role.ngo.orgName}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                          <StatusIcon className="w-2.5 h-2.5" /> {statusInfo.label}
                        </span>
                      </Link>
                      <div className="border-t border-gray-100 px-4 py-3">
                        <ApplicationDetails coverNote={app.coverNote} linkedinUrl={app.linkedinUrl} appliedAt={app.appliedAt} compact />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}

/* ── Submitted application read-only view ─────────────────── */
function ApplicationDetails({
  coverNote,
  linkedinUrl,
  appliedAt,
  compact = false,
}: {
  coverNote: string;
  linkedinUrl: string | null;
  appliedAt: Date;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-gray-100 bg-gray-50 ${compact ? "p-3" : "p-4"} space-y-2`}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
        <FileText className="w-3 h-3" /> Your application · {new Date(appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
      {coverNote && (
        <p className={`text-gray-600 leading-relaxed ${compact ? "text-[11px] line-clamp-2" : "text-xs"}`}>
          &ldquo;{coverNote}&rdquo;
        </p>
      )}
      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-[11px] text-[#0A66C2] font-medium hover:underline"
        >
          <Linkedin className="w-3 h-3" /> LinkedIn profile
        </a>
      )}
    </div>
  );
}
