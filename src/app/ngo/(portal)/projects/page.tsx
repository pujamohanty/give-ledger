import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  PENDING_REVIEW: { label: "Pending Review", color: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completed", color: "bg-blue-100 text-blue-700" },
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-600" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-600" },
};

const categoryLabel: Record<string, string> = {
  INCOME_GENERATION: "Income Generation",
  CHILD_CARE: "Child Care",
  ELDERLY_CARE: "Elderly Care",
  PHYSICALLY_DISABLED: "Accessibility",
  PET_CARE: "Pet Care",
  OTHER: "Other",
};

export default async function NgoProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ngo = await prisma.ngo.findUnique({
    where: { userId: session.user.id },
    include: {
      projects: {
        include: {
          milestones: {
            include: { disbursement: true },
            orderBy: { orderIndex: "asc" },
          },
          donations: { select: { userId: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ngo) redirect("/login");

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your fundraising projects and milestone submissions.
          </p>
        </div>
        <Link href="/ngo/projects/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </Link>
      </div>

      {ngo.projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Plus className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No projects yet — create your first project to start fundraising.</p>
          <Link href="/ngo/projects/new">
            <Button size="sm" className="mt-4">Create First Project</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ngo.projects.map((project) => {
            const pct = project.goalAmount > 0
              ? Math.round((project.raisedAmount / project.goalAmount) * 100)
              : 0;
            const cfg = statusConfig[project.status] ?? { label: project.status, color: "bg-gray-100 text-gray-600" };
            const completedMilestones = project.milestones.filter((m) => m.status === "COMPLETED").length;
            const pendingDisbursement = project.milestones
              .filter((m) => m.disbursement?.status === "PENDING")
              .reduce((sum, m) => sum + (m.disbursement?.requestedAmount ?? 0), 0);
            const nextMilestone = project.milestones.find(
              (m) => m.status === "PENDING" || m.status === "UNDER_REVIEW"
            );
            const uniqueDonors = new Set(project.donations.map((d) => d.userId)).size;

            return (
              <Card key={project.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700">
                        {categoryLabel[project.category] ?? project.category}
                      </p>
                    </div>
                    {pendingDisbursement > 0 && (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">Pending release</p>
                        <p className="text-sm font-bold text-amber-700">
                          {formatCurrency(pendingDisbursement)}
                        </p>
                      </div>
                    )}
                  </div>

                  {project.status !== "PENDING_REVIEW" && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{formatCurrency(project.raisedAmount)} raised of {formatCurrency(project.goalAmount)}</span>
                        <span>{pct}%</span>
                      </div>
                      <Progress value={pct} />
                    </div>
                  )}

                  {project.status === "PENDING_REVIEW" && (
                    <div className="flex items-center gap-2 text-amber-700 text-xs bg-amber-50 rounded-lg p-3 mb-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Under admin review. You will be notified within 48 hours.
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {completedMilestones}/{project.milestones.length} milestones
                    </span>
                    {nextMilestone && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="w-3 h-3" />
                        Next: {nextMilestone.name}
                        {nextMilestone.targetDate && ` · ${formatDate(nextMilestone.targetDate)}`}
                      </span>
                    )}
                    {uniqueDonors > 0 && <span>{uniqueDonors} donors</span>}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Link href={`/ngo/submit-milestone?project=${project.id}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                        Manage <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                    {pendingDisbursement > 0 && (
                      <Link href={`/ngo/submit-milestone?project=${project.id}`}>
                        <Button size="sm" className="text-xs">
                          Request Disbursement
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
