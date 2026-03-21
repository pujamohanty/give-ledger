import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Users, Wifi, MapPin, UserCircle, ExternalLink } from "lucide-react";
import { ApplicationActions, CompleteEngagementButton } from "@/components/RoleApplicationActions";


const applicationStatusColors: Record<string, string> = {
  PENDING:   "bg-amber-50 text-amber-700 border-amber-100",
  ACCEPTED:  "bg-emerald-50 text-emerald-700 border-emerald-100",
  REJECTED:  "bg-gray-100 text-gray-500 border-gray-200",
  WITHDRAWN: "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function NgoRoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) redirect("/ngo/dashboard");

  const role = await prisma.ngoRole.findFirst({
    where: { id, ngoId: ngo.id },
    include: {
      project: { select: { title: true } },
      applications: {
        include: {
          applicant: {
            select: {
              id: true, name: true, email: true, image: true,
              jobTitle: true, company: true, city: true,
              linkedinUrl: true, portfolioUrl: true,
              subscription: { select: { plan: true } },
            },
          },
          engagement: true,
        },
        orderBy: { appliedAt: "desc" },
      },
    },
  });

  if (!role) notFound();

  const pending   = role.applications
    .filter((a) => a.status === "PENDING")
    .sort((a, b) => {
      // PRO applicants appear first
      const aIsPro = a.applicant.subscription?.plan === "PRO" ? 0 : 1;
      const bIsPro = b.applicant.subscription?.plan === "PRO" ? 0 : 1;
      return aIsPro - bIsPro;
    });
  const accepted  = role.applications.filter((a) => a.status === "ACCEPTED");
  const active    = accepted.filter((a) => a.engagement?.status === "ACTIVE");
  const completed = accepted.filter((a) => a.engagement?.status === "COMPLETED");

  return (
    <div className="p-6 lg:p-8 max-w-4xl">

      {/* Back + header */}
      <Link href="/ngo/roles">
        <Button variant="ghost" size="sm" className="mb-4 flex items-center gap-2 text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Back to roles
        </Button>
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{role.title}</h1>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {role.timeCommitment}</span>
              <span>·</span>
              <span>{role.durationWeeks} weeks</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {role.isRemote ? <><Wifi className="w-3 h-3" /> Remote</> : <><MapPin className="w-3 h-3" /> {role.location}</>}
              </span>
              {role.project && <><span>·</span><span className="text-emerald-600">{role.project.title}</span></>}
            </div>
          </div>
          <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
            role.status === "OPEN" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-100 text-gray-500 border-gray-200"
          }`}>
            {role.status}
          </span>
        </div>

        <div className="flex gap-5 mt-4 pt-4 border-t border-gray-100">
          {[
            { label: "Total applied", value: role.applications.length },
            { label: "Pending review", value: pending.length },
            { label: "Active engagements", value: active.length },
            { label: "Completed", value: completed.length },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-[11px] text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">

        {/* Pending applications */}
        {pending.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Pending applications ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((app) => (
                <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                        {app.applicant.name?.slice(0, 2).toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                          {app.applicant.name ?? "Applicant"}
                          {app.applicant.subscription?.plan === "PRO" && (
                            <span className="text-[9px] font-bold bg-violet-600 text-white px-1.5 py-0.5 rounded-full leading-tight">
                              PRO
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {[app.applicant.jobTitle, app.applicant.company].filter(Boolean).join(" · ")}
                          {app.applicant.city && <span className="ml-1">· {app.applicant.city}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {app.applicant.linkedinUrl && (
                        <a href={app.applicant.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> LinkedIn
                        </a>
                      )}
                      {app.applicant.portfolioUrl && (
                        <a href={app.applicant.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Portfolio
                        </a>
                      )}
                      <Link href={`/donor/${app.applicant.id}/profile`} className="text-xs text-gray-500 hover:text-emerald-700 flex items-center gap-1">
                        <UserCircle className="w-3 h-3" /> Profile
                      </Link>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Cover note</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{app.coverNote}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-gray-400">
                      Applied {new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <ApplicationActions applicationId={app.id} applicantName={app.applicant.name ?? "Applicant"} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active engagements */}
        {active.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Active engagements ({active.length})
            </h2>
            <div className="space-y-3">
              {active.map((app) => (
                <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">
                        {app.applicant.name?.slice(0, 2).toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{app.applicant.name ?? "Contributor"}</p>
                        <p className="text-[11px] text-gray-500">
                          {[app.applicant.jobTitle, app.applicant.company].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{app.engagement?.hoursLogged ?? 0}h</p>
                        <p className="text-[11px] text-gray-400">logged</p>
                      </div>
                      {app.engagement && (
                        <CompleteEngagementButton
                          engagementId={app.engagement.id}
                          contributorName={app.applicant.name ?? "Contributor"}
                          roleTitle={role.title}
                          hoursLogged={app.engagement.hoursLogged}
                        />
                      )}
                    </div>
                  </div>
                  {app.engagement?.workSummary && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Latest work update</p>
                      <p className="text-xs text-gray-600">{app.engagement.workSummary}</p>
                    </div>
                  )}
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
                <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                        {app.applicant.name?.slice(0, 2).toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{app.applicant.name ?? "Contributor"}</p>
                        <p className="text-[11px] text-gray-400">
                          {app.engagement?.hoursLogged ?? 0}h ·{" "}
                          {app.engagement?.completedAt
                            ? new Date(app.engagement.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : ""}
                          {app.engagement?.monetaryValue ? ` · $${app.engagement.monetaryValue.toLocaleString()} estimated value` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  </div>
                  {app.engagement?.ngoFeedback && (
                    <p className="mt-2 text-xs text-gray-500 italic">&quot;{app.engagement.ngoFeedback}&quot;</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All other applications */}
        {role.applications.filter(a => a.status !== "PENDING" && a.status !== "ACCEPTED").length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Other applications
            </h2>
            <div className="space-y-2">
              {role.applications.filter(a => a.status !== "PENDING" && a.status !== "ACCEPTED").map((app) => (
                <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {app.applicant.name?.slice(0, 2).toUpperCase() ?? "?"}
                    </div>
                    <p className="text-xs text-gray-600">{app.applicant.name ?? "Applicant"}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${applicationStatusColors[app.status] ?? ""}`}>
                    {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {role.applications.length === 0 && (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No applications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Share the opportunity page to attract contributors.
            </p>
            <a
              href={`/opportunities/${role.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-700 font-medium hover:underline"
            >
              <ExternalLink className="w-3 h-3" /> View public listing
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
