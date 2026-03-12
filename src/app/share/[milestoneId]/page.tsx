import Link from "next/link";
import { CheckCircle2, ExternalLink, Shield, Leaf, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Mock data keyed by milestoneId — in production this would be a DB lookup
const milestoneData: Record<string, {
  milestoneName: string;
  projectTitle: string;
  ngoName: string;
  category: string;
  metric: string;
  outputMarkers: { label: string; value: string }[];
  narrative: string;
  txHash: string;
  completedAt: string;
  evidenceFiles: { name: string; type: string }[];
  projectId: string;
  donorCount: number;
}> = {
  "m1": {
    milestoneName: "Installation — Schools 1–6",
    projectTitle: "Clean Water for Kibera Schools",
    ngoName: "WaterBridge Kenya",
    category: "Child Care",
    metric: "2,400 children now have access to clean drinking water daily",
    outputMarkers: [
      { label: "Schools fitted", value: "6 of 12" },
      { label: "Students benefiting", value: "2,400" },
      { label: "Water quality pass rate", value: "100%" },
      { label: "Filtration units installed", value: "6" },
    ],
    narrative: "All six filtration units in the first phase have been installed, tested, and signed off by school principals. Water quality tests conducted by an independent lab show 100% pathogen removal. Children are already using the filtered water stations.",
    txHash: "0x7d6e5f4c3b2a1908e7d6c5b4a39281706f5e4d3c2b1a09887766554433221100",
    completedAt: "Feb 3, 2026",
    evidenceFiles: [
      { name: "water-quality-lab-report.pdf", type: "PDF" },
      { name: "installation-photos-school1-6.zip", type: "ZIP" },
      { name: "principal-signoffs.pdf", type: "PDF" },
    ],
    projectId: "1",
    donorCount: 142,
  },
  "m2": {
    milestoneName: "Cohort 1 — 45 Women Trained & Certified",
    projectTitle: "Livelihood Training - Rural Bihar",
    ngoName: "Pragati Foundation",
    category: "Income Generation",
    metric: "45 women completed vocational training and received certification",
    outputMarkers: [
      { label: "Women trained", value: "45" },
      { label: "Certifications issued", value: "45" },
      { label: "Starter kits distributed", value: "45" },
      { label: "Businesses already started", value: "7" },
    ],
    narrative: "Cohort 1 of 45 women across 2 villages completed 8 weeks of vocational training in tailoring and electronics repair. All 45 received government-recognised certifications. Each was given a starter kit. 7 women have already started home-based businesses.",
    txHash: "0x9a8b7c6d5e4f3021a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6",
    completedAt: "Jan 28, 2026",
    evidenceFiles: [
      { name: "attendance-records-cohort1.pdf", type: "PDF" },
      { name: "certification-copies.pdf", type: "PDF" },
      { name: "training-photos.zip", type: "ZIP" },
    ],
    projectId: "2",
    donorCount: 89,
  },
};

export function generateStaticParams() {
  return Object.keys(milestoneData).map((id) => ({ milestoneId: id }));
}

export default async function SharePage({ params }: { params: Promise<{ milestoneId: string }> }) {
  const { milestoneId } = await params;
  const data = milestoneData[milestoneId];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">This milestone page could not be found.</p>
          <Link href="/projects"><Button>Browse Projects</Button></Link>
        </div>
      </div>
    );
  }

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
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{data.category}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">{data.ngoName}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.milestoneName}</h1>
          <p className="text-lg text-gray-600">{data.projectTitle}</p>
        </div>

        {/* Key metric — the impact statement */}
        <Card className="mb-6 border-0 shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">What was achieved</p>
                <p className="text-xl font-bold text-gray-900">{data.metric}</p>
                <p className="text-sm text-gray-500 mt-2">Completed {data.completedAt} · {data.donorCount} donors contributed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output markers */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {data.outputMarkers.map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* NGO narrative */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">NGO Completion Report</p>
            <p className="text-gray-700 leading-relaxed">{data.narrative}</p>
          </CardContent>
        </Card>

        {/* Evidence files */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Evidence Files</p>
            <div className="space-y-2">
              {data.evidenceFiles.map((file) => (
                <div key={file.name} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-white bg-gray-400 px-2 py-0.5 rounded">{file.type}</span>
                    <span className="text-sm text-gray-700">{file.name}</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* On-chain proof */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Blockchain Record</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Transaction Hash (Polygon)</p>
              <p className="text-sm font-mono text-gray-800 break-all">{data.txHash}</p>
              <a
                href={`https://polygonscan.com/tx/${data.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 mt-3"
              >
                Verify on PolygonScan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </CardContent>
        </Card>

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
