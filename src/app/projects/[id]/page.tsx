"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Shield,
  Clock,
  Users,
  ArrowLeft,
  CreditCard,
  X,
} from "lucide-react";

const projectData = {
  "1": {
    title: "Clean Water for Kibera Schools",
    ngo: "WaterBridge Kenya",
    ngoId: "ngo1",
    category: "Child Care",
    description: `Water contamination affects over 60% of Kibera residents. Children at the 12 schools in our programme are drinking untreated water daily — leading to typhoid, cholera, and chronic absence from school.

WaterBridge Kenya has been operating in Kibera since 2018. This project installs industrial-grade filtration units at each school, provides maintenance training to school staff, and delivers clean water to approximately 6,200 students daily.

Every milestone is documented with photographic evidence, water quality test results, and school attendance data — all verifiable on-chain.`,
    raised: 18400,
    goal: 25000,
    backers: 142,
    daysLeft: 22,
    image: "💧",
    milestones: [
      { name: "Equipment procurement & import clearance", status: "COMPLETED", date: "Jan 15", fundAmount: 6000, txHash: "0x4a3b2c1d..." },
      { name: "Installation — Schools 1-6", status: "COMPLETED", date: "Feb 3", fundAmount: 5000, txHash: "0x7d6e5f4c..." },
      { name: "Installation — Schools 7-12", status: "UNDER_REVIEW", date: "Mar 20", fundAmount: 7500, txHash: null },
      { name: "Community training & handover", status: "PENDING", date: "Apr 10", fundAmount: 6500, txHash: null },
    ],
    impactMetrics: [
      { label: "Schools covered", value: "6 of 12" },
      { label: "Students with clean water", value: "2,400" },
      { label: "Water quality test pass rate", value: "100%" },
    ],
    recentDonations: [
      { name: "Priya S.", amount: 500, time: "2 hours ago" },
      { name: "Anonymous", amount: 100, time: "5 hours ago" },
      { name: "Rahul M.", amount: 200, time: "1 day ago" },
    ],
  },
};

const suggestedAmounts = [25, 50, 100, 250, 500];

function DonationModal({ projectTitle, projectId, onClose }: { projectTitle: string; projectId: string; onClose: () => void }) {
  const [amount, setAmount] = useState<number>(50);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  const finalAmount = custom ? parseFloat(custom) : amount;

  const handleDonate = async () => {
    if (!finalAmount || finalAmount < 1) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, projectTitle, amount: finalAmount }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Make a Donation</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-5">
            Supporting: <strong>{projectTitle}</strong>
          </p>

          <p className="text-sm font-medium text-gray-700 mb-3">Select amount (USD)</p>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {suggestedAmounts.map((a) => (
              <button
                key={a}
                onClick={() => { setAmount(a); setCustom(""); }}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                  amount === a && !custom
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-gray-200 text-gray-700 hover:border-emerald-400"
                }`}
              >
                ${a}
              </button>
            ))}
          </div>

          <input
            type="number"
            min="1"
            placeholder="Custom amount"
            value={custom}
            onChange={(e) => { setCustom(e.target.value); setAmount(0); }}
            className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
          />

          <div className="bg-emerald-50 rounded-lg p-3 mb-5 flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800">
              Your donation is milestone-locked. Funds are released only when verified
              deliverables are completed and recorded on-chain.
            </p>
          </div>

          <Button
            onClick={handleDonate}
            disabled={loading || !finalAmount || finalAmount < 1}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <CreditCard className="w-4 h-4" />
            {loading ? "Redirecting to Stripe..." : `Donate $${finalAmount || 0} Securely`}
          </Button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Secured by Stripe · SSL encrypted · Instant receipt
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [donationOpen, setDonationOpen] = useState(false);
  const project = projectData[params.id as keyof typeof projectData] ?? projectData["1"];
  const pct = Math.round((project.raised / project.goal) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {donationOpen && (
        <DonationModal
          projectTitle={project.title}
          projectId={params.id}
          onClose={() => setDonationOpen(false)}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="mb-4 flex items-center gap-2 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> All Projects
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero */}
            <Card>
              <div className="h-56 bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center rounded-t-xl text-7xl">
                {project.image}
              </div>
              <CardContent className="p-6">
                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5 text-xs font-semibold mb-3">
                  {project.category}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.title}</h1>
                <p className="text-emerald-700 font-medium text-sm mb-4">{project.ngo}</p>

                <Progress value={pct} className="mb-3" />
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span className="font-bold text-gray-900 text-lg">
                    ${project.raised.toLocaleString()}
                  </span>
                  <span className="text-gray-400">
                    of ${project.goal.toLocaleString()} goal
                  </span>
                </div>

                <div className="flex gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.backers} donors
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {project.daysLeft} days left
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Verified NGO</span>
                  </div>
                </div>

                <Button size="lg" className="w-full" onClick={() => setDonationOpen(true)}>
                  Donate to This Project
                </Button>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-gray-900 mb-4">About This Project</h2>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {project.description}
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-gray-900 mb-5">Milestone Tracker</h2>
                <div className="space-y-4">
                  {project.milestones.map((m, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {m.status === "COMPLETED" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : m.status === "UNDER_REVIEW" ? (
                          <Circle className="w-5 h-5 text-amber-500 fill-amber-100" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-200" />
                        )}
                        {i < project.milestones.length - 1 && (
                          <div className={`w-0.5 h-full mt-1 ${m.status === "COMPLETED" ? "bg-emerald-200" : "bg-gray-100"}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`text-sm font-medium ${m.status === "COMPLETED" ? "text-gray-700" : m.status === "UNDER_REVIEW" ? "text-amber-800" : "text-gray-400"}`}>
                              {m.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{m.date}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              m.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                              m.status === "UNDER_REVIEW" ? "bg-amber-100 text-amber-700" :
                              "bg-gray-100 text-gray-500"
                            }`}>
                              {m.status === "COMPLETED" ? "Complete" : m.status === "UNDER_REVIEW" ? "Under Review" : "Pending"}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">${m.fundAmount.toLocaleString()} release</p>
                          </div>
                        </div>
                        {m.txHash && (
                          <a
                            href={`https://polygonscan.com/tx/${m.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-1"
                          >
                            View on Polygon <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Impact metrics */}
            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-5">
                <h3 className="font-semibold text-emerald-900 mb-4">Impact So Far</h3>
                <div className="space-y-3">
                  {project.impactMetrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-xs text-emerald-700">{m.label}</p>
                      <p className="font-bold text-emerald-900 text-lg">{m.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent donors */}
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Supporters</h3>
                <div className="space-y-3">
                  {project.recentDonations.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                          {d.name[0]}
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">{d.name}</p>
                          <p className="text-xs text-gray-400">{d.time}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-emerald-700">
                        ${d.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trust badge */}
            <Card className="bg-emerald-950 text-white">
              <CardContent className="p-5">
                <Shield className="w-6 h-6 text-emerald-400 mb-2" />
                <h3 className="font-semibold mb-2 text-sm">Trust Guarantee</h3>
                <p className="text-xs text-emerald-300 leading-relaxed">
                  Every financial event is recorded on the Polygon blockchain. Funds are
                  released only when milestones are verified by our admin team.
                </p>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full" onClick={() => setDonationOpen(true)}>
              Donate Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
