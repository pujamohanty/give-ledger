import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Send, Building2, Heart, CheckCircle, MessageCircle,
  Bookmark, ChevronRight, Clock, TrendingUp,
} from "lucide-react";

const STATUS_CONFIG = {
  SAVED: {
    label: "Saved to Pipeline",
    icon: Bookmark,
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-600",
    badge: "bg-gray-100 text-gray-600",
  },
  REACHED_OUT: {
    label: "Reached Out",
    icon: Send,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
  },
  RESPONDED: {
    label: "They Responded",
    icon: CheckCircle,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  IN_CONVERSATION: {
    label: "In Conversation",
    icon: MessageCircle,
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    badge: "bg-violet-100 text-violet-700",
  },
} as const;

const STATUS_ORDER = ["IN_CONVERSATION", "RESPONDED", "REACHED_OUT", "SAVED"] as const;

export default async function OutreachPipelinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const contacts = await prisma.outreachContact.findMany({
    where: { userId: session.user.id },
    include: {
      company: {
        select: { id: true, legalName: true, dbaName: true, naicsDescription: true, city: true, state: true },
      },
    },
    orderBy: { sentAt: "desc" },
  });

  // Group by status
  type ContactWithCompany = typeof contacts[0];
  const grouped: Record<string, ContactWithCompany[]> = {};
  for (const c of contacts) {
    grouped[c.status] = [...(grouped[c.status] ?? []), c];
  }

  // Stats
  const total = contacts.length;
  const responded = contacts.filter((c) => c.status === "RESPONDED" || c.status === "IN_CONVERSATION").length;
  const companies = contacts.filter((c) => c.companyId).length;
  const ngos = contacts.filter((c) => c.ein).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Send className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Outreach Pipeline</h1>
        </div>
        <p className="text-sm text-gray-500 ml-10">
          Track your proactive outreach to companies and NGOs.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Contacts", value: total, icon: Send, color: "text-blue-600 bg-blue-50" },
          { label: "Responded", value: responded, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
          { label: "Companies", value: companies, icon: Building2, color: "text-indigo-600 bg-indigo-50" },
          { label: "NGOs", value: ngos, icon: Heart, color: "text-violet-600 bg-violet-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {total === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Send className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">No outreach yet</h2>
          <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
            Visit a company or NGO profile and click &ldquo;Express Interest&rdquo; to start building your pipeline.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/companies"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <Building2 className="w-4 h-4" /> Browse Companies
            </Link>
            <Link
              href="/ngos"
              className="inline-flex items-center gap-1.5 text-sm font-medium border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl transition-colors"
            >
              <Heart className="w-4 h-4" /> Browse NGOs
            </Link>
          </div>
        </div>
      )}

      {/* Pipeline columns */}
      {total > 0 && (
        <div className="space-y-6">
          {STATUS_ORDER.map((status) => {
            const items = grouped[status] ?? [];
            if (items.length === 0) return null;
            const cfg = STATUS_CONFIG[status];
            const Icon = cfg.icon;
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                    <span className="ml-0.5 opacity-70">({items.length})</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {items.map((contact) => {
                    const isCompany = !!contact.companyId;
                    const name = isCompany
                      ? (contact.company?.dbaName ?? contact.company?.legalName ?? "Unknown Company")
                      : `EIN ${contact.ein}`;
                    const sector = contact.company?.naicsDescription ?? "";
                    const location = isCompany
                      ? [contact.company?.city, contact.company?.state].filter(Boolean).join(", ")
                      : "";
                    const href = isCompany ? `/companies/${contact.companyId}` : `/ngo/${contact.ein}`;
                    const sentDate = new Date(contact.sentAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    });
                    return (
                      <div
                        key={contact.id}
                        className={`bg-white rounded-xl border ${cfg.border} p-4 hover:shadow-sm transition-shadow`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold ${isCompany ? "bg-blue-100 text-blue-700" : "bg-violet-100 text-violet-700"}`}>
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                              {sector && <p className="text-xs text-gray-500 mt-0.5 truncate">{sector}</p>}
                              {location && <p className="text-xs text-gray-400 mt-0.5">{location}</p>}
                              {contact.roleTitleRef && (
                                <p className="text-xs text-blue-600 mt-1 font-medium">
                                  Role: {contact.roleTitleRef}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isCompany ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}>
                                {isCompany ? "Company" : "NGO"}
                              </span>
                              <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-0.5 justify-end">
                                <Clock className="w-2.5 h-2.5" />
                                {sentDate}
                              </p>
                            </div>
                            <Link href={href} className="text-gray-300 hover:text-gray-600 transition-colors">
                              <ChevronRight className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Tip */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Click any card to revisit the profile and update the outreach status.
              Companies build candidate pipelines — reaching out early often leads to opportunities
              before they&apos;re posted publicly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
