"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ExternalLink, Shield, Clock, Users, ArrowLeft, CreditCard, X } from "lucide-react";
import { notFound } from "next/navigation";

const allProjects = {
  "1": {
    title: "Clean Water for Kibera Schools",
    ngo: "WaterBridge Kenya",
    category: "Child Care",
    description: `Water contamination affects over 60% of Kibera residents. Children at the 12 schools in our programme are drinking untreated water daily — leading to typhoid, cholera, and chronic absence from school.\n\nWaterBridge Kenya has been operating in Kibera since 2018. This project installs industrial-grade filtration units at each school, provides maintenance training to school staff, and delivers clean water to approximately 6,200 students daily.\n\nEvery milestone is documented with photographic evidence, water quality test results, and school attendance data — all verifiable on-chain.`,
    raised: 18400, goal: 25000, backers: 142, daysLeft: 22, image: "💧",
    milestones: [
      { name: "Equipment procurement & import clearance", status: "COMPLETED", date: "Jan 15", fundAmount: 6000, txHash: "0x4a3b2c1d..." },
      { name: "Installation — Schools 1–6", status: "COMPLETED", date: "Feb 3", fundAmount: 5000, txHash: "0x7d6e5f4c..." },
      { name: "Installation — Schools 7–12", status: "UNDER_REVIEW", date: "Mar 20", fundAmount: 7500, txHash: null },
      { name: "Community training & handover", status: "PENDING", date: "Apr 10", fundAmount: 6500, txHash: null },
    ],
    impactMetrics: [{ label: "Schools covered", value: "6 of 12" }, { label: "Students with clean water", value: "2,400" }, { label: "Water quality pass rate", value: "100%" }],
    recentDonations: [{ name: "Priya S.", amount: 500, time: "2h ago" }, { name: "Anonymous", amount: 100, time: "5h ago" }, { name: "Rahul M.", amount: 200, time: "1d ago" }],
  },
  "2": {
    title: "Livelihood Training - Rural Bihar",
    ngo: "Pragati Foundation",
    category: "Income Generation",
    description: `Unemployment among rural women in Bihar exceeds 70%. Pragati Foundation has been running vocational training programmes since 2015, helping women gain skills in tailoring, electronics repair, and mobile servicing.\n\nThis project funds training for 200 women across 5 villages over 8 months. Each cohort receives certification, starter kit, and 6 months of business mentorship.\n\nMilestone evidence includes attendance sheets, certification records, and income data collected 3 months post-training.`,
    raised: 31200, goal: 40000, backers: 89, daysLeft: 35, image: "🧵",
    milestones: [
      { name: "Training centre setup", status: "COMPLETED", date: "Dec 10", fundAmount: 8000, txHash: "0x2c1d3e4f..." },
      { name: "Cohort 1 — 45 women trained", status: "COMPLETED", date: "Jan 28", fundAmount: 12000, txHash: "0x9a8b7c6d..." },
      { name: "Cohort 2 — 45 women trained", status: "PENDING", date: "Mar 15", fundAmount: 12000, txHash: null },
      { name: "Business mentorship & follow-up", status: "PENDING", date: "May 1", fundAmount: 8000, txHash: null },
    ],
    impactMetrics: [{ label: "Women trained", value: "45 of 90" }, { label: "Businesses started", value: "7" }, { label: "Avg income increase", value: "+35%" }],
    recentDonations: [{ name: "Sarah K.", amount: 1000, time: "1d ago" }, { name: "Anonymous", amount: 250, time: "2d ago" }, { name: "Anjali P.", amount: 150, time: "3d ago" }],
  },
  "3": {
    title: "Elderly Care Home - Mysore",
    ngo: "SilverYears Trust",
    category: "Elderly Care",
    description: `India has over 100 million elderly citizens, and fewer than 5% have access to organised elder care. Abandoned seniors in Mysore often live without nutrition, medical care, or human contact.\n\nSilverYears Trust is constructing a 50-bed care facility with on-site medical staff, nutritional meals, therapy rooms, and a garden. The facility will also run community outreach for seniors who prefer to age at home.\n\nAll construction milestones are verified by a licensed architect and documented on-chain.`,
    raised: 62000, goal: 80000, backers: 317, daysLeft: 14, image: "🏠",
    milestones: [
      { name: "Land acquisition & permits", status: "COMPLETED", date: "Nov 5", fundAmount: 15000, txHash: "0x5b4c3d2e..." },
      { name: "Foundation & ground floor structure", status: "COMPLETED", date: "Jan 20", fundAmount: 25000, txHash: "0x1a2b3c4d..." },
      { name: "Roof, electrical & plumbing", status: "UNDER_REVIEW", date: "Mar 30", fundAmount: 20000, txHash: null },
      { name: "Furnishing, staffing & inauguration", status: "PENDING", date: "May 15", fundAmount: 20000, txHash: null },
    ],
    impactMetrics: [{ label: "Construction progress", value: "60%" }, { label: "Bed capacity", value: "50 residents" }, { label: "Staff hired", value: "8" }],
    recentDonations: [{ name: "Meena R.", amount: 2000, time: "3h ago" }, { name: "Anonymous", amount: 500, time: "6h ago" }, { name: "David L.", amount: 1000, time: "1d ago" }],
  },
  "4": {
    title: "Wheelchair Access - Mumbai Slums",
    ngo: "AccessAbility India",
    category: "Accessibility",
    description: `Over 120 wheelchair users in Dharavi and Govandi face daily barriers — stairs, uneven paths, and narrow doorways that make independent movement impossible.\n\nAccessAbility India will install concrete ramps, handrails, and widened doorways in 8 key community buildings including health centres, schools, and market areas.\n\nAll installations are designed by certified civil engineers and verified by occupational therapists confirming accessibility standards.`,
    raised: 8900, goal: 15000, backers: 67, daysLeft: 45, image: "♿",
    milestones: [
      { name: "Engineering survey & design", status: "COMPLETED", date: "Feb 1", fundAmount: 2000, txHash: "0x6c7d8e9f..." },
      { name: "Buildings 1–4 installation", status: "PENDING", date: "Apr 1", fundAmount: 6000, txHash: null },
      { name: "Buildings 5–8 installation", status: "PENDING", date: "May 15", fundAmount: 7000, txHash: null },
    ],
    impactMetrics: [{ label: "Buildings surveyed", value: "8 of 8" }, { label: "Ramps installed", value: "0 of 16" }, { label: "Users to benefit", value: "120+" }],
    recentDonations: [{ name: "Vikram S.", amount: 300, time: "4h ago" }, { name: "Anonymous", amount: 100, time: "1d ago" }, { name: "Fatima A.", amount: 500, time: "2d ago" }],
  },
  "5": {
    title: "Animal Rescue & Rehabilitation",
    ngo: "PawsNairobi",
    category: "Animal Welfare",
    description: `Nairobi has an estimated 30,000 abandoned street animals. Without intervention, most face disease, starvation, and road accidents. PawsNairobi currently operates with temporary foster care but lacks a permanent facility.\n\nThis project funds construction of a 200-animal rescue centre with veterinary facilities, surgical suite, isolation ward, and adoption programme. We will also train 50 community volunteers in first-response animal care.\n\nAll outcomes are documented with animal intake records, veterinary reports, and adoption data.`,
    raised: 5200, goal: 12000, backers: 44, daysLeft: 60, image: "🐾",
    milestones: [
      { name: "Site preparation & foundation", status: "PENDING", date: "Apr 15", fundAmount: 3000, txHash: null },
      { name: "Kennel & veterinary facility build", status: "PENDING", date: "Jun 1", fundAmount: 5000, txHash: null },
      { name: "Volunteer training programme", status: "PENDING", date: "Jul 1", fundAmount: 4000, txHash: null },
    ],
    impactMetrics: [{ label: "Animals in foster care", value: "48" }, { label: "Vets partnered", value: "3" }, { label: "Adoption applications", value: "22 pending" }],
    recentDonations: [{ name: "Grace M.", amount: 200, time: "5h ago" }, { name: "Anonymous", amount: 50, time: "2d ago" }, { name: "James O.", amount: 100, time: "3d ago" }],
  },
  "6": {
    title: "Solar Microgrids for Rural Schools",
    ngo: "SunPower Africa",
    category: "Income Generation",
    description: `6 rural schools in Uganda spend up to $400/month on diesel generators for electricity. Students cannot study after dark and teachers lack reliable power for projectors or computers.\n\nSunPower Africa will install rooftop solar panels, battery storage, and a local microgrid at each school. This will eliminate generator costs, enable evening study sessions, and power a computer lab at each site.\n\nAll installations are certified by licensed electrical engineers. Power output, student hours, and cost savings are tracked monthly.`,
    raised: 42000, goal: 55000, backers: 201, daysLeft: 28, image: "☀️",
    milestones: [
      { name: "Equipment procurement & shipping", status: "COMPLETED", date: "Jan 10", fundAmount: 15000, txHash: "0x3e4f5a6b..." },
      { name: "Installation — Schools 1–3", status: "COMPLETED", date: "Feb 20", fundAmount: 15000, txHash: "0xf1e2d3c4..." },
      { name: "Installation — Schools 4–6", status: "PENDING", date: "Mar 25", fundAmount: 15000, txHash: null },
      { name: "Monitoring & impact report", status: "PENDING", date: "May 1", fundAmount: 10000, txHash: null },
    ],
    impactMetrics: [{ label: "Schools electrified", value: "3 of 6" }, { label: "Students with evening study", value: "860" }, { label: "Monthly savings", value: "$1,200" }],
    recentDonations: [{ name: "Marcus T.", amount: 500, time: "1h ago" }, { name: "Aisha B.", amount: 300, time: "4h ago" }, { name: "Anonymous", amount: 100, time: "8h ago" }],
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
      if (data.url) window.location.href = data.url;
    } catch { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Make a Donation</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-gray-500 mb-5">Supporting: <strong>{projectTitle}</strong></p>
          <p className="text-sm font-medium text-gray-700 mb-3">Select amount (USD)</p>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {suggestedAmounts.map((a) => (
              <button key={a} onClick={() => { setAmount(a); setCustom(""); }}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${amount === a && !custom ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-200 text-gray-700 hover:border-emerald-400"}`}>
                ${a}
              </button>
            ))}
          </div>
          <input type="number" min="1" placeholder="Custom amount" value={custom}
            onChange={(e) => { setCustom(e.target.value); setAmount(0); }}
            className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4" />
          <div className="bg-emerald-50 rounded-lg p-3 mb-5 flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800">Your donation is milestone-locked. Funds release only when verified deliverables are recorded on-chain.</p>
          </div>
          <Button onClick={handleDonate} disabled={loading || !finalAmount || finalAmount < 1} className="w-full flex items-center justify-center gap-2" size="lg">
            <CreditCard className="w-4 h-4" />
            {loading ? "Redirecting to Stripe..." : `Donate $${finalAmount || 0} Securely`}
          </Button>
          <p className="text-center text-xs text-gray-400 mt-3">Secured by Stripe · SSL encrypted · Instant receipt</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProjectDetailClient({ projectId }: { projectId: string }) {
  const [donationOpen, setDonationOpen] = useState(false);
  const project = allProjects[projectId as keyof typeof allProjects];
  if (!project) return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <p className="text-2xl font-bold text-gray-900 mb-2">Project not found</p>
      <Link href="/projects"><Button variant="outline">Back to Projects</Button></Link>
    </div>
  );

  const pct = Math.round((project.raised / project.goal) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {donationOpen && <DonationModal projectTitle={project.title} projectId={projectId} onClose={() => setDonationOpen(false)} />}

      <Link href="/projects">
        <Button variant="ghost" size="sm" className="mb-4 flex items-center gap-2 text-gray-500">
          <ArrowLeft className="w-4 h-4" /> All Projects
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="h-56 bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center rounded-t-xl text-7xl">{project.image}</div>
            <CardContent className="p-6">
              <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5 text-xs font-semibold mb-3">{project.category}</span>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.title}</h1>
              <p className="text-emerald-700 font-medium text-sm mb-4">{project.ngo}</p>
              <Progress value={pct} className="mb-3" />
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span className="font-bold text-gray-900 text-lg">${project.raised.toLocaleString()}</span>
                <span className="text-gray-400">of ${project.goal.toLocaleString()} goal</span>
              </div>
              <div className="flex gap-6 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{project.backers} donors</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{project.daysLeft} days left</span>
                <span className="flex items-center gap-1 text-emerald-700"><Shield className="w-4 h-4" />Verified NGO</span>
              </div>
              <Button size="lg" className="w-full" onClick={() => setDonationOpen(true)}>Donate to This Project</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-gray-900 mb-4">About This Project</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{project.description}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-bold text-gray-900 mb-5">Milestone Tracker</h2>
              <div className="space-y-4">
                {project.milestones.map((m, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {m.status === "COMPLETED" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : m.status === "UNDER_REVIEW" ? <Circle className="w-5 h-5 text-amber-500 fill-amber-100" /> : <Circle className="w-5 h-5 text-gray-200" />}
                      {i < project.milestones.length - 1 && <div className={`w-0.5 h-full mt-1 ${m.status === "COMPLETED" ? "bg-emerald-200" : "bg-gray-100"}`} />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={`text-sm font-medium ${m.status === "COMPLETED" ? "text-gray-700" : m.status === "UNDER_REVIEW" ? "text-amber-800" : "text-gray-400"}`}>{m.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{m.date}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : m.status === "UNDER_REVIEW" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                            {m.status === "COMPLETED" ? "Complete" : m.status === "UNDER_REVIEW" ? "Under Review" : "Pending"}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">${m.fundAmount.toLocaleString()} release</p>
                        </div>
                      </div>
                      {m.txHash && (
                        <a href={`https://polygonscan.com/tx/${m.txHash}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-1">
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

        <div className="space-y-4">
          <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-5">
              <h3 className="font-semibold text-emerald-900 mb-4">Impact So Far</h3>
              <div className="space-y-3">
                {project.impactMetrics.map((m) => (
                  <div key={m.label}><p className="text-xs text-emerald-700">{m.label}</p><p className="font-bold text-emerald-900 text-lg">{m.value}</p></div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Supporters</h3>
              <div className="space-y-3">
                {project.recentDonations.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">{d.name[0]}</div>
                      <div><p className="text-sm text-gray-700">{d.name}</p><p className="text-xs text-gray-400">{d.time}</p></div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">${d.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-950 text-white">
            <CardContent className="p-5">
              <Shield className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="font-semibold mb-2 text-sm">Trust Guarantee</h3>
              <p className="text-xs text-emerald-300 leading-relaxed">Every financial event is recorded on the Polygon blockchain. Funds are released only when milestones are verified by our admin team.</p>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full" onClick={() => setDonationOpen(true)}>Donate Now</Button>
        </div>
      </div>
    </div>
  );
}
