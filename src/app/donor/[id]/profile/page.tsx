import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Linkedin, Twitter, Globe, MapPin, Briefcase, CheckCircle2,
  ExternalLink, Building2, FileText, Heart, TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function DonorPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      jobTitle: true,
      company: true,
      city: true,
      linkedinUrl: true,
      twitterUrl: true,
      portfolioUrl: true,
      skills: true,
      skillContributions: {
        where: { status: "APPROVED" },
        select: {
          id: true,
          skillCategory: true,
          description: true,
          hoursContributed: true,
          monetaryValue: true,
          approvedAt: true,
          ngo: { select: { orgName: true } },
          project: { select: { title: true } },
        },
        orderBy: { approvedAt: "desc" },
        take: 10,
      },
      donations: {
        where: { status: "COMPLETED" },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          project: { select: { id: true, title: true, ngo: { select: { orgName: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      documents: {
        where: { category: { not: "OTHER" } },
        select: { id: true, fileName: true, category: true, mimeType: true, fileSize: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { donations: true },
      },
    },
  });

  if (!user) notFound();

  const skills = user.skills ? user.skills.split(",").filter(Boolean) : [];
  const hasProfile = user.bio || user.jobTitle || user.company || skills.length > 0 || user.linkedinUrl;
  const totalDonated = user.donations.reduce((sum, d) => sum + d.amount, 0);
  const totalSkillValue = user.skillContributions.reduce((sum, c) => sum + (c.monetaryValue ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-emerald-700 font-bold text-lg">GiveLedger</Link>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Donor Profile</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Identity card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-emerald-700">
                {user.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900">{user.name ?? "Anonymous Donor"}</h1>
                {(user.jobTitle || user.company) && (
                  <p className="text-gray-600 text-sm mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    {[user.jobTitle, user.company].filter(Boolean).join(" at ")}
                  </p>
                )}
                {user.city && (
                  <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {user.city}
                  </p>
                )}
                {(user.linkedinUrl || user.twitterUrl || user.portfolioUrl) && (
                  <div className="flex items-center gap-3 mt-3">
                    {user.linkedinUrl && (
                      <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium">
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                    {user.twitterUrl && (
                      <a href={user.twitterUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-sky-500 hover:underline font-medium">
                        <Twitter className="w-3.5 h-3.5" /> X <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                    {user.portfolioUrl && (
                      <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-600 hover:underline font-medium">
                        <Globe className="w-3.5 h-3.5" /> Portfolio <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            {user.bio && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
              </div>
            )}
            {!hasProfile && (
              <p className="text-sm text-gray-400 mt-2 italic">This donor hasn&apos;t filled in their profile yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Impact stats */}
        {(totalDonated > 0 || user.skillContributions.length > 0) && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Donated", value: `$${totalDonated.toLocaleString()}`, icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
              { label: "Projects Funded", value: user._count.donations.toString(), icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Skill Value", value: totalSkillValue > 0 ? `$${totalSkillValue.toLocaleString()}` : `${user.skillContributions.length} contrib.`, icon: Briefcase, color: "text-violet-600", bg: "bg-violet-50" },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" /> Skills Available
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
                    {s}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents & Credentials */}
        {user.documents.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Documents &amp; Credentials
              </h2>
              <div className="space-y-2">
                {user.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={`/api/donor/documents/${doc.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-emerald-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate group-hover:text-emerald-700">{doc.fileName}</p>
                      <p className="text-xs text-gray-400">{doc.category} · {(doc.fileSize / 1024).toFixed(0)}KB</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 shrink-0" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verified skill contributions */}
        {user.skillContributions.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Contributions
              </h2>
              <div className="space-y-4">
                {user.skillContributions.map((c) => (
                  <div key={c.id} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.skillCategory}</p>
                          <p className="text-xs text-gray-500">
                            {c.ngo.orgName}{c.project ? ` · ${c.project.title}` : ""}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {c.monetaryValue && (
                            <p className="text-sm font-bold text-emerald-700">${c.monetaryValue.toLocaleString()}</p>
                          )}
                          {c.hoursContributed && (
                            <p className="text-xs text-gray-400">{c.hoursContributed}h</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{c.description}</p>
                      {c.approvedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Verified {new Date(c.approvedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent donations */}
        {user.donations.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" /> Recent Donations
              </h2>
              <div className="space-y-3">
                {user.donations.map((d) => (
                  <div key={d.id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 truncate">{d.project.title}</p>
                      <p className="text-xs text-gray-400">{d.project.ngo.orgName}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-semibold text-rose-600">${d.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!hasProfile && user.skillContributions.length === 0 && user.donations.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-gray-400">This donor&apos;s profile is still being set up.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
