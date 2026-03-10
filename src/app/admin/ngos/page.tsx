import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Globe,
  Building2,
  FileText,
  Clock,
} from "lucide-react";

const applications = [
  {
    id: "1",
    name: "EduBridge Foundation",
    regNumber: "RC-2019-07812",
    country: "Nigeria",
    contact: "James Adeyemi",
    email: "james@edubridge.ng",
    website: "www.edubridge.ng",
    category: "CHILD_CARE",
    submitted: "Mar 8, 2025",
    docs: 3,
    status: "PENDING",
    description: "Providing quality education to underprivileged children in Lagos state through mobile school units.",
  },
  {
    id: "2",
    name: "GreenFields Trust",
    regNumber: "CIN-U74900-DL2020",
    country: "India",
    contact: "Ananya Krishnan",
    email: "ananya@greenfields.org",
    website: "www.greenfields.in",
    category: "INCOME_GENERATION",
    submitted: "Mar 7, 2025",
    docs: 2,
    status: "PENDING",
    description: "Agricultural training and micro-loan support for marginal farmers in Rajasthan.",
  },
  {
    id: "3",
    name: "Hope Circle NGO",
    regNumber: "NGO-KE-44521",
    country: "Kenya",
    contact: "Grace Mutua",
    email: "grace@hopecircle.ke",
    website: "www.hopecircle.ke",
    category: "ELDERLY_CARE",
    submitted: "Mar 5, 2025",
    docs: 4,
    status: "PENDING",
    description: "Community eldercare programs providing medical support, nutrition, and social connection to seniors in rural Kenya.",
  },
  {
    id: "4",
    name: "TechSkills Rwanda",
    regNumber: "RCA-2021-1183",
    country: "Rwanda",
    contact: "Patrick Nkurunziza",
    email: "patrick@techskillsrw.org",
    website: "www.techskillsrw.org",
    category: "INCOME_GENERATION",
    submitted: "Feb 28, 2025",
    docs: 5,
    status: "APPROVED",
    description: "Digital literacy and software development training for youth in Kigali.",
  },
];

const categoryLabel: Record<string, string> = {
  CHILD_CARE: "Child Care",
  INCOME_GENERATION: "Income Generation",
  ELDERLY_CARE: "Elderly Care",
  PHYSICALLY_DISABLED: "Accessibility",
};

export default function AdminNgosPage() {
  const pending = applications.filter((a) => a.status === "PENDING");
  const approved = applications.filter((a) => a.status === "APPROVED");

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">NGO Applications</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review and approve NGO registration requests.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pending Review", value: pending.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Approved (Total)", value: "48", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Rejected (YTD)", value: "7", icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
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
                        <p className="text-sm text-gray-500 flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {app.country}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span>{app.regNumber}</span>
                          <span className="text-gray-300">|</span>
                          <span>{categoryLabel[app.category] || app.category}</span>
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        Submitted {app.submitted}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{app.description}</p>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                      <span>Contact: {app.contact} ({app.email})</span>
                      <span>Website: {app.website}</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {app.docs} documents uploaded
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Approve NGO
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> Request Info
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recently approved */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Recently Approved
        </h2>
        <div className="space-y-3">
          {approved.map((app) => (
            <Card key={app.id} className="border-emerald-100 bg-emerald-50/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{app.name}</p>
                    <p className="text-xs text-gray-500">
                      {app.country} · {app.regNumber} · Approved
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
    </div>
  );
}
