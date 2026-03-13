"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, XCircle, MessageSquare, Globe, Building2, FileText, Clock,
} from "lucide-react";

export type NgoApplication = {
  id: string;
  name: string;
  regNumber: string | null;
  country: string | null;
  contactName: string | null;
  email: string | null;
  website: string | null;
  status: string;
  description: string | null;
  submittedAt: Date;
};

export default function NgosClient({ initialApplications }: { initialApplications: NgoApplication[] }) {
  const [applications, setApplications] = useState<NgoApplication[]>(initialApplications);
  const [acting, setActing] = useState<string | null>(null);

  const handleAction = async (ngoId: string, action: "APPROVE" | "REJECT") => {
    setActing(ngoId);
    setApplications((prev) =>
      prev.map((a) =>
        a.id === ngoId ? { ...a, status: action === "APPROVE" ? "ACTIVE" : "REJECTED" } : a
      )
    );
    try {
      await fetch("/api/admin/approve-ngo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ngoId, action }),
      });
    } catch {
      // optimistic update stays
    }
    setActing(null);
  };

  const pending = applications.filter((a) => a.status === "PENDING");
  const approved = applications.filter((a) => a.status === "ACTIVE");
  const rejected = applications.filter((a) => a.status === "REJECTED");

  function timeLabel(date: Date): string {
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">NGO Applications</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve NGO registration requests.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pending Review", value: pending.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Approved (Total)", value: approved.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Rejected", value: rejected.length, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending applications */}
      <div className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No pending applications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((app) => (
              <Card key={app.id} className="border-amber-100">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{app.name}</h3>
                          <p className="text-sm text-gray-500 flex flex-wrap items-center gap-3 mt-0.5">
                            {app.country && (
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" /> {app.country}
                              </span>
                            )}
                            {app.regNumber && <span>{app.regNumber}</span>}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          Submitted {timeLabel(app.submittedAt)}
                        </span>
                      </div>

                      {app.description && (
                        <p className="text-sm text-gray-600 mb-3">{app.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                        {app.contactName && <span>Contact: {app.contactName}</span>}
                        {app.email && <span>{app.email}</span>}
                        {app.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {app.website}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Registration details on file
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1"
                          disabled={acting === app.id}
                          onClick={() => handleAction(app.id, "APPROVE")}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {acting === app.id ? "Processing..." : "Approve NGO"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                          disabled={acting === app.id}
                          onClick={() => handleAction(app.id, "REJECT")}
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Request Info
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recently approved */}
      {approved.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Active NGOs
          </h2>
          <div className="space-y-3">
            {approved.map((app) => (
              <Card key={app.id} className="border-emerald-100 bg-emerald-50/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{app.name}</p>
                      <p className="text-xs text-gray-500">
                        {app.country && `${app.country} · `}
                        {app.regNumber && `${app.regNumber} · `}
                        Active
                      </p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
