import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Users, CheckCircle, Clock, XCircle } from "lucide-react";

const roleTypeLabels: Record<string, string> = {
  INTERNSHIP: "Internship",
  CAREER_TRANSITION: "Career Transition",
  INTERIM: "Interim Role",
  VOLUNTEER: "Volunteer",
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  OPEN:   { label: "Open",   color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: CheckCircle },
  CLOSED: { label: "Closed", color: "text-gray-500 bg-gray-100 border-gray-200",         icon: XCircle },
  FILLED: { label: "Filled", color: "text-blue-700 bg-blue-50 border-blue-100",           icon: Users },
};

export default async function NgoRolesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const ngo = await prisma.ngo.findUnique({ where: { userId: session.user.id } });
  if (!ngo) redirect("/ngo/dashboard");

  const roles = await prisma.ngoRole.findMany({
    where: { ngoId: ngo.id },
    include: {
      _count: { select: { applications: true } },
      applications: { where: { status: "ACCEPTED" }, select: { id: true } },
      project: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const open = roles.filter((r) => r.status === "OPEN");
  const closed = roles.filter((r) => r.status !== "OPEN");

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Open Roles</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Post skill and time-based opportunities for contributors.
          </p>
        </div>
        <Link href="/ngo/roles/new">
          <Button className="gap-2 text-sm">
            <Plus className="w-4 h-4" /> Post a role
          </Button>
        </Link>
      </div>

      {roles.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No roles posted yet</p>
          <p className="text-xs text-gray-400 mb-5">
            Post your first open role to attract skilled contributors who can help your projects.
          </p>
          <Link href="/ngo/roles/new">
            <Button className="gap-2 text-sm"><Plus className="w-4 h-4" /> Post your first role</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Open roles */}
          {open.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Open ({open.length})
              </h2>
              <div className="space-y-3">
                {open.map((role) => <RoleCard key={role.id} role={role} />)}
              </div>
            </section>
          )}

          {/* Closed / filled */}
          {closed.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Closed / Filled ({closed.length})
              </h2>
              <div className="space-y-3">
                {closed.map((role) => <RoleCard key={role.id} role={role} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function RoleCard({ role }: {
  role: {
    id: string;
    title: string;
    roleType: string;
    status: string;
    timeCommitment: string;
    durationWeeks: number;
    isRemote: boolean;
    createdAt: Date;
    project: { title: string } | null;
    _count: { applications: number };
    applications: { id: string }[];
  };
}) {
  const statusInfo = statusConfig[role.status] ?? statusConfig.OPEN;
  const StatusIcon = statusInfo.icon;
  const acceptedCount = role.applications.length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{role.title}</p>
          <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
            <StatusIcon className="w-2.5 h-2.5" />
            {statusInfo.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
          <span>{roleTypeLabels[role.roleType] ?? role.roleType}</span>
          <span>·</span>
          <span>{role.timeCommitment}</span>
          <span>·</span>
          <span>{role.durationWeeks}w</span>
          <span>·</span>
          <span>{role.isRemote ? "Remote" : "On-site"}</span>
          {role.project && <><span>·</span><span className="text-emerald-600">{role.project.title}</span></>}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Stats */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {role._count.applications} applied
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            {acceptedCount} accepted
          </span>
        </div>

        <Link href={`/ngo/roles/${role.id}`}>
          <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
            <Clock className="w-3.5 h-3.5" />
            Manage
          </Button>
        </Link>
      </div>
    </div>
  );
}
