import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { LogHoursButton } from "@/components/RoleApplicationActions";
import {
  Briefcase, Clock, CheckCircle, XCircle, Search,
  Star, ExternalLink, ChevronRight,
} from "lucide-react";

const roleTypeLabels: Record<string, string> = {
  INTERNSHIP: "Internship", CAREER_TRANSITION: "Career Transition",
  INTERIM: "Interim Role", VOLUNTEER: "Volunteer",
};

const appStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:   { label: "Under review",  color: "text-amber-700 bg-amber-50 border-amber-100",     icon: Clock },
  ACCEPTED:  { label: "Accepted",       color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: CheckCircle },
  REJECTED:  { label: "Not selected",  color: "text-gray-500 bg-gray-100 border-gray-200",        icon: XCircle },
  WITHDRAWN: { label: "Withdrawn",     color: "text-gray-500 bg-gray-100 border-gray-200",        icon: XCircle },
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
          <h1 className="text-xl font-bold text-gray-900">My Opportunities</h1>
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
                  <div key={app.id} className="bg-white border border-emerald-200 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900">{app.role.title}</p>
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            {roleTypeLabels[app.role.roleType]}
                          </span>
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
                    </div>

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
                      {app.engagement && (
                        <LogHoursButton
                          engagementId={app.engagement.id}
                          currentHours={app.engagement.hoursLogged}
                        />
                      )}
                    </div>

                    {app.engagement?.workSummary && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3">
                        <p className="text-[11px] text-gray-400 mb-1">Latest update</p>
                        <p className="text-xs text-gray-600">{app.engagement.workSummary}</p>
                      </div>
                    )}
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
              <div className="space-y-2">
                {pending.map((app) => (
                  <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{app.role.title}</p>
                      <p className="text-xs text-gray-500">{app.role.ngo.orgName} · {roleTypeLabels[app.role.roleType]}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-gray-400">
                        {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-100">
                        <Clock className="w-2.5 h-2.5" /> Under review
                      </span>
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
                  <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{app.role.title}</p>
                        <p className="text-xs text-gray-500">{app.role.ngo.orgName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">{app.engagement?.hoursLogged ?? 0}h</p>
                        {app.engagement?.monetaryValue && (
                          <p className="text-[11px] text-emerald-600">${app.engagement.monetaryValue.toLocaleString()} value</p>
                        )}
                      </div>
                    </div>

                    {app.engagement?.ngoFeedback && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-2">
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
                      <Link
                        href="/donor/credential"
                        className="text-xs text-emerald-700 font-medium hover:underline flex items-center gap-1"
                      >
                        View on credential <ChevronRight className="w-3 h-3" />
                      </Link>
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
                    <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-600 truncate">{app.role.title}</p>
                        <p className="text-[11px] text-gray-400">{app.role.ngo.orgName}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/opportunities/${app.role.id}`} className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                          <StatusIcon className="w-2.5 h-2.5" /> {statusInfo.label}
                        </span>
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
