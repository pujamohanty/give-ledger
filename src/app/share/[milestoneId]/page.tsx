import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink, Shield, Leaf, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function SharePage({ params }: { params: Promise<{ milestoneId: string }> }) {
  const { milestoneId } = await params;

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      project: {
        include: {
          ngo: { select: { orgName: true } },
          donations: { select: { id: true } },
        },
      },
      evidenceFiles: { select: { id: true, fileName: true, fileType: true } },
      outputMarkers: { select: { id: true, label: true, value: true } },
      disbursement: {
        include: { blockchainRecord: true },
      },
    },
  });

  if (!milestone || milestone.status !== "COMPLETED") {
    notFound();
  }

  const txHash =
    milestone.disbursement?.blockchainRecord?.txHash ??
    milestone.disbursement?.txHash ??
    null;

  const completedAt = milestone.completedAt
    ? new Date(milestone.completedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const donorCount = milestone.project.donations.length;
  const primaryMarker = milestone.outputMarkers[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-emerald-700">
            <Leaf className="w-5 h-5" />
            GiveLedger
          </Link>
          <Link href="/projects">
            <Button size="sm" variant="outline">Browse Projects</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Verification banner */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-8">
          <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Milestone Verified On-Chain</p>
            <p className="text-xs text-emerald-700 mt-0.5">Funds were released only after this evidence was reviewed and approved by GiveLedger admin.</p>
          </div>
        </div>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{milestone.project.category}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">{milestone.project.ngo.orgName}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{milestone.name}</h1>
          <p className="text-lg text-gray-600">{milestone.project.title}</p>
        </div>

        {/* Key metric */}
        {primaryMarker && (
          <Card className="mb-6 border-0 shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">What was achieved</p>
                  <p className="text-xl font-bold text-gray-900">{primaryMarker.value} {primaryMarker.label}</p>
                  {completedAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Completed {completedAt}
                      {donorCount > 0 && ` · ${donorCount} donor${donorCount !== 1 ? "s" : ""} contributed`}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Output markers grid */}
        {milestone.outputMarkers.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {milestone.outputMarkers.map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                <p className="text-xs text-gray-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Milestone deliverable */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Milestone Description</p>
            <p className="text-gray-700 leading-relaxed">{milestone.completionNarrative ?? milestone.description ?? "—"}</p>
          </CardContent>
        </Card>

        {/* Evidence files */}
        {milestone.evidenceFiles.length > 0 && (
          <Card className="mb-6 border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Evidence Files</p>
              <div className="space-y-2">
                {milestone.evidenceFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-white bg-gray-400 px-2 py-0.5 rounded">
                        {file.fileType ?? "FILE"}
                      </span>
                      <span className="text-sm text-gray-700">{file.fileName}</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* On-chain proof */}
        {txHash && (
          <Card className="mb-8 border-0 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Blockchain Record</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash (Polygon)</p>
                <p className="text-sm font-mono text-gray-800 break-all">{txHash}</p>
                <a
                  href={`https://polygonscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 mt-3"
                >
                  Verify on PolygonScan <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Every donation is tracked this way</h2>
          <p className="text-emerald-100 text-sm mb-6">
            GiveLedger only releases funds when milestones are verified. Browse projects where your donation has a traceable journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/projects">
              <Button className="bg-white text-emerald-700 hover:bg-gray-50 gap-2 w-full sm:w-auto">
                Browse Projects <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="border-white/50 text-white hover:bg-white/10 w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
