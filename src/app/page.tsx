import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import {
  Shield,
  Eye,
  CheckCircle2,
  TrendingUp,
  Globe,
  Leaf,
  Star,
  ChevronRight,
  Landmark,
  BookOpen,
  Heart,
  Activity,
  ArrowRight,
} from "lucide-react";

const featuredProjects = [
  {
    id: "1",
    title: "Clean Water for Kibera Schools",
    ngo: "WaterBridge Kenya",
    category: "CHILD_CARE",
    description:
      "Installing water filtration systems in 12 schools across Kibera, providing safe drinking water to 6,000+ students.",
    raised: 18400,
    goal: 25000,
    image: "💧",
    backers: 142,
  },
  {
    id: "2",
    title: "Livelihood Training - Rural Bihar",
    ngo: "Pragati Foundation",
    category: "INCOME_GENERATION",
    description:
      "Vocational training in tailoring, electronics repair, and mobile servicing for 200 rural women in Bihar.",
    raised: 31200,
    goal: 40000,
    image: "🧵",
    backers: 89,
  },
  {
    id: "3",
    title: "Elderly Care Home - Mysore",
    ngo: "SilverYears Trust",
    category: "ELDERLY_CARE",
    description:
      "Building a dignified care facility for 50 elderly residents with medical support and recreational activities.",
    raised: 62000,
    goal: 80000,
    image: "🏠",
    backers: 317,
  },
];

const stats = [
  { label: "Total Funds Tracked", value: "$2.4M+", icon: TrendingUp },
  { label: "Active NGOs", value: "48", icon: Landmark },
  { label: "Projects Funded", value: "134", icon: BookOpen },
  { label: "Countries", value: "12", icon: Globe },
];

const howItWorksDonor = [
  {
    step: "01",
    title: "Sign Up & Browse",
    desc: "Create your account with Google in seconds. Browse verified projects by cause, location, or urgency.",
  },
  {
    step: "02",
    title: "Donate Securely",
    desc: "Contribute via card or UPI. Your donation is tracked through a milestone-based release system.",
  },
  {
    step: "03",
    title: "Track Every Rupee",
    desc: "Watch your funds move in real-time. Get notified when each milestone is completed with photo evidence.",
  },
];

const howItWorksNgo = [
  {
    step: "01",
    title: "Register & Verify",
    desc: "Submit your NGO registration. Our team verifies your credentials within 48 hours.",
  },
  {
    step: "02",
    title: "Create Projects",
    desc: "Define your project with clear milestones, timelines, and fund requirements per milestone.",
  },
  {
    step: "03",
    title: "Receive Milestone Funds",
    desc: "Upload evidence when milestones are complete. Funds are released on admin approval - every release is on-chain.",
  },
];

const impactStories = [
  {
    quote:
      "For the first time, my donors can actually see where their money goes. Our re-donation rate jumped from 12% to 68% in one year.",
    name: "David Ochieng",
    role: "Programme Director, EduReach Nairobi",
    avatar: "D",
  },
  {
    quote:
      "I donated to a school project and watched every milestone get completed with photos. I donated again the next month - I knew it worked.",
    name: "Priya Sharma",
    role: "Marketing Director, Mumbai",
    avatar: "P",
  },
];

function categoryLabel(cat: string) {
  const labels: Record<string, string> = {
    INCOME_GENERATION: "Income Generation",
    CHILD_CARE: "Child Care",
    ELDERLY_CARE: "Elderly Care",
    PHYSICALLY_DISABLED: "Accessibility",
    PET_CARE: "Animal Welfare",
    OTHER: "Other",
  };
  return labels[cat] || cat;
}

export default function LandingPage() {
  const totalPledged = 2_400_000;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-700/50 text-emerald-200 border border-emerald-600/50 rounded-full px-3 py-1 text-xs mb-6">
              Blockchain-Powered Transparency
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Every dollar donated
              <br />
              <span className="text-emerald-400">deserves a story.</span>
            </h1>
            <p className="text-xl text-emerald-100 mb-10 max-w-2xl leading-relaxed">
              GiveLedger creates an immutable, traceable record of every
              donation from your wallet to real-world impact. No black boxes. No
              excuses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8"
                >
                  Start Donating <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/signup?role=ngo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent px-8"
                >
                  Register as NGO
                </Button>
              </Link>
            </div>
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-200 text-sm font-medium">
                Live:
              </span>
              <span className="text-white font-bold text-lg">
                ${totalPledged.toLocaleString()}
              </span>
              <span className="text-emerald-200 text-sm">
                pledged on platform
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            The trust gap in charitable giving
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            60% of donors say they would give more if they had better
            visibility. We built the infrastructure to close that gap.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-red-100 bg-red-50/50">
            <CardContent className="p-8">
              <h3 className="font-bold text-red-700 text-lg mb-6">
                Without GiveLedger
              </h3>
              <div className="space-y-4">
                {[
                  "Donate and hear nothing back",
                  "No proof funds were used as promised",
                  "Cannot choose specific projects",
                  "NGOs spend 30% of time on reporting",
                  "Donors stop giving after one cycle",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-red-700">
                    <span className="mt-0.5 text-red-400 font-bold">x</span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 bg-emerald-50/50">
            <CardContent className="p-8">
              <h3 className="font-bold text-emerald-700 text-lg mb-6">
                With GiveLedger
              </h3>
              <div className="space-y-4">
                {[
                  "Real-time dashboard - know exactly where every rupee goes",
                  "Immutable blockchain record of every financial event",
                  "Choose specific projects and causes you care about",
                  "NGOs log milestones; funds release automatically on proof",
                  "Impact notifications keep donors engaged and coming back",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Projects
              </h2>
              <p className="text-gray-500 mt-2">
                Verified, milestone-tracked projects ready for your support.
              </p>
            </div>
            <Link href="/projects">
              <Button
                variant="outline"
                className="hidden sm:flex items-center gap-2"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => {
              const pct = Math.round((project.raised / project.goal) * 100);
              return (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center rounded-t-xl text-5xl">
                    {project.image}
                  </div>
                  <CardContent className="p-5">
                    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5 text-xs font-semibold mb-3">
                      {categoryLabel(project.category)}
                    </span>
                    <h3 className="font-semibold text-gray-900 mb-1 text-base leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-emerald-700 font-medium mb-3">
                      {project.ngo}
                    </p>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    <Progress value={pct} className="mb-3" />
                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span className="font-semibold text-gray-900">
                        ${project.raised.toLocaleString()} raised
                      </span>
                      <span>
                        {pct}% of ${project.goal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {project.backers} donors
                      </span>
                      <Link href={`/projects/${project.id}`}>
                        <Button size="sm">Donate Now</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            How GiveLedger Works
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Simple for donors. Powerful for NGOs. Transparent for everyone.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
              <Heart className="w-5 h-5 text-emerald-600" /> For Donors
            </h3>
            <div className="space-y-6">
              {howItWorksDonor.map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex-shrink-0 flex items-center justify-center">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div id="for-ngos">
            <h3 className="text-xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
              <Landmark className="w-5 h-5 text-emerald-600" /> For NGOs
            </h3>
            <div className="space-y-6">
              {howItWorksNgo.map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex-shrink-0 flex items-center justify-center">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="bg-emerald-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Built on trust infrastructure
            </h2>
            <p className="text-emerald-300 max-w-xl mx-auto">
              Three pillars that make GiveLedger different from every other
              platform.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Smart Contract Enforcement",
                desc: "Funds are held in escrow and released only when milestones are verified. No human override without audit trail.",
              },
              {
                icon: Eye,
                title: "Complete Transparency",
                desc: "Every financial event is logged on-chain with a public transaction hash you can verify yourself.",
              },
              {
                icon: Activity,
                title: "Real-Time Impact Tracking",
                desc: "NGOs log output markers (meals served, students enrolled) that update your personal impact dashboard instantly.",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center px-4">
                <div className="w-14 h-14 bg-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="w-7 h-7 text-emerald-300" />
                </div>
                <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-emerald-300 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Real impact, real voices
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {impactStories.map((story) => (
            <Card key={story.name} className="p-6 border-gray-100">
              <CardContent className="p-0">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  &quot;{story.quote}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                    {story.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {story.name}
                    </p>
                    <p className="text-xs text-gray-500">{story.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Leaf className="w-10 h-10 mx-auto mb-6 text-emerald-200" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Make your next donation count - provably.
          </h2>
          <p className="text-emerald-100 mb-8 text-lg max-w-xl mx-auto">
            Join thousands of donors who know exactly where their money goes -
            and NGOs that prove they deliver.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-8"
              >
                Start Donating
              </Button>
            </Link>
            <Link href="/signup?role=ngo">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 bg-transparent px-8"
              >
                Register Your NGO
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
                <Leaf className="w-5 h-5 text-emerald-500" /> GiveLedger
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Trust infrastructure for charitable giving.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold mb-3 text-sm">Platform</p>
              <div className="space-y-2 text-sm">
                <Link
                  href="/projects"
                  className="block hover:text-white transition-colors"
                >
                  Browse Projects
                </Link>
                <Link
                  href="/#how-it-works"
                  className="block hover:text-white transition-colors"
                >
                  How It Works
                </Link>
                <Link
                  href="/signup?role=ngo"
                  className="block hover:text-white transition-colors"
                >
                  For NGOs
                </Link>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-3 text-sm">Company</p>
              <div className="space-y-2 text-sm">
                <span className="block">About</span>
                <span className="block">Blog</span>
                <span className="block">Careers</span>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-3 text-sm">Legal</p>
              <div className="space-y-2 text-sm">
                <span className="block">Privacy Policy</span>
                <span className="block">Terms of Service</span>
                <span className="block">Cookie Policy</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs">2025 GiveLedger. All rights reserved.</p>
            <p className="text-xs">Built on Polygon - Powered by transparency</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
