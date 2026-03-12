import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";

const projects = [
  {
    id: "p1",
    title: "Kibera School Water Project",
    category: "Child Care",
    status: "ACTIVE",
    raised: 18400,
    goal: 25000,
    completedMilestones: 2,
    totalMilestones: 4,
    nextMilestone: "Installation Phase 2",
    nextDate: "Mar 20, 2026",
    pendingDisbursement: 5000,
    donors: 38,
  },
  {
    id: "p2",
    title: "Women Vocational Training Bihar",
    category: "Income Generation",
    status: "ACTIVE",
    raised: 31200,
    goal: 40000,
    completedMilestones: 2,
    totalMilestones: 3,
    nextMilestone: "Cohort 2 training",
    nextDate: "Mar 15, 2026",
    pendingDisbursement: 7500,
    donors: 64,
  },
  {
    id: "p3",
    title: "Elderly Care Infrastructure - Mysore",
    category: "Elderly Care",
    status: "PENDING_REVIEW",
    raised: 0,
    goal: 80000,
    completedMilestones: 0,
    totalMilestones: 5,
    nextMilestone: "Awaiting admin approval",
    nextDate: "-",
    pendingDisbursement: 0,
    donors: 0,
  },
  {
    id: "p4",
    title: "Accessible Ramps — Delhi Schools",
    category: "Accessibility",
    status: "COMPLETED",
    raised: 12000,
    goal: 12000,
    completedMilestones: 3,
    totalMilestones: 3,
    nextMilestone: "All milestones complete",
    nextDate: "-",
    pendingDisbursement: 0,
    donors: 29,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ACTIVE: { label: "Active", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  PENDING_REVIEW: { label: "Pending Review", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  COMPLETED: { label: "Completed", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
};

export default function NgoProjectsPage() {
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

      <div className="space-y-4">
        {projects.map((project) => {
          const pct = project.goal > 0 ? Math.round((project.raised / project.goal) * 100) : 0;
          const cfg = statusConfig[project.status];
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
                    <p className="text-xs text-emerald-700">{project.category}</p>
                  </div>
                  {project.pendingDisbursement > 0 && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">Pending release</p>
                      <p className="text-sm font-bold text-amber-700">
                        ${project.pendingDisbursement.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {project.status !== "PENDING_REVIEW" && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>${project.raised.toLocaleString()} raised of ${project.goal.toLocaleString()}</span>
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
                    {project.completedMilestones}/{project.totalMilestones} milestones
                  </span>
                  {project.nextDate !== "-" && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock className="w-3 h-3" />
                      Next: {project.nextMilestone} · {project.nextDate}
                    </span>
                  )}
                  {project.donors > 0 && (
                    <span>{project.donors} donors</span>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link href={`/ngo/submit-milestone?project=${project.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                      Manage <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                  {project.pendingDisbursement > 0 && (
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
    </div>
  );
}
