import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  TRAINING_MODULES,
  TOTAL_LESSONS,
  TOTAL_HOURS,
  MODULE_COUNT,
} from "@/lib/training-curriculum";
import TrainingShareButton from "@/components/TrainingShareButton";
import {
  BookOpen, Clock, Zap, Layers, GraduationCap, ChevronRight,
  Terminal, Wrench, TrendingUp, DollarSign, Settings,
  Users, Scale, BarChart2, Cpu, GitBranch, Lightbulb, Smartphone, Star,
} from "lucide-react";

const levelConfig = {
  Beginner:     { badge: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  Intermediate: { badge: "bg-blue-100 text-blue-700",       bar: "bg-blue-500",    dot: "bg-blue-500"    },
  Advanced:     { badge: "bg-violet-100 text-violet-700",   bar: "bg-violet-500",  dot: "bg-violet-500"  },
};

const typeLabel: Record<string, string> = {
  guide:          "Guide",
  exercise:       "Exercise",
  project:        "Project",
  "prompt-library": "Prompt Library",
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Getting Started": Terminal,
  "Terminal & Tools": Terminal,
  "Building":        Wrench,
  "Marketing":       TrendingUp,
  "Finance":         DollarSign,
  "Operations":      Settings,
  "HR & People":     Users,
  "Legal":           Scale,
  "Data & Impact":   BarChart2,
  "Product & Tech":  Cpu,
  "Automation":      GitBranch,
  "Strategy":        Lightbulb,
};

export default async function TrainingHubPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userStats = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { trainingShareCount: true, impactScore: true },
  });
  const trainingShareCount = userStats?.trainingShareCount ?? 0;

  const beginner     = TRAINING_MODULES.filter((m) => m.level === "Beginner");
  const intermediate = TRAINING_MODULES.filter((m) => m.level === "Intermediate");
  const advanced     = TRAINING_MODULES.filter((m) => m.level === "Advanced");

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 text-xs font-semibold text-emerald-700 mb-4">
                <GraduationCap className="w-3.5 h-3.5" />
                Free for all donors
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                AI Training Academy
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                Learn to use Claude Code for real business work — from your first terminal command to fully automated
                workflows across marketing, finance, HR, legal and more. No coding experience required.
              </p>
            </div>
            <div className="bg-emerald-700 text-white rounded-2xl px-6 py-5 text-center min-w-[160px]">
              <p className="text-3xl font-extrabold">$2,500</p>
              <p className="text-emerald-200 text-xs mt-1">Estimated market value</p>
              <p className="text-emerald-300 text-[10px] mt-2 font-semibold uppercase tracking-wide">Yours free</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { icon: Layers,   value: MODULE_COUNT,   label: "Modules"     },
              { icon: BookOpen, value: TOTAL_LESSONS,  label: "Lessons"     },
              { icon: Clock,    value: TOTAL_HOURS,    label: "Hours"       },
              { icon: Zap,      value: "80+",          label: "Live prompts"},
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-gray-900 leading-none">{value}</p>
                  <p className="text-[11px] text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Level progression */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl px-6 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Learning path</p>
            <div className="flex items-center gap-0">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((level, i) => (
                <div key={level} className="flex items-center">
                  {i > 0 && <div className="w-12 h-px bg-gray-300 mx-1" />}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${levelConfig[level].dot}`} />
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelConfig[level].badge}`}>
                      {level}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {level === "Beginner" ? "3 modules" : level === "Intermediate" ? "6 modules" : "3 modules"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share section — boost impact score */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Spread the word</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <TrainingShareButton initialCount={trainingShareCount} />
      </div>

      {/* Beta UGC card */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <Link
          href="/donor/beta-program"
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl px-5 py-4 hover:from-violet-700 hover:to-purple-800 transition-all group"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold text-white">Beta Tester &amp; UGC Creator Program</p>
              <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">Earn money</span>
            </div>
            <p className="text-[11px] text-violet-200 leading-relaxed">
              Get paid $3,000–$5,000/month to test apps and create content for brands. Open to all GiveLedger donors.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
            <Star className="w-3.5 h-3.5" /> Join program
          </div>
        </Link>
      </div>

      {/* Module groups */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-14">
        {[
          { level: "Beginner" as const,     modules: beginner,     desc: "Set up Claude Code and master the foundations — no prior experience needed." },
          { level: "Intermediate" as const, modules: intermediate, desc: "Apply AI to every function in your organisation — marketing, finance, ops, HR, legal, data." },
          { level: "Advanced" as const,     modules: advanced,     desc: "Build automated pipelines, multi-agent systems, and lead AI transformation at an organisational level." },
        ].map(({ level, modules, desc }) => {
          const cfg = levelConfig[level];
          return (
            <div key={level}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${cfg.badge}`}>{level}</span>
                <div className={`h-px flex-1 ${cfg.bar} opacity-20`} />
              </div>
              <p className="text-sm text-gray-500 mb-5">{desc}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((mod) => {
                  const CategoryIcon = categoryIcons[mod.category] ?? BookOpen;
                  return (
                    <Link
                      key={mod.slug}
                      href={`/donor/training/${mod.slug}`}
                      className="group bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] hover:border-emerald-300 hover:shadow-md transition-all overflow-hidden flex flex-col"
                    >
                      {/* Card top colour strip */}
                      <div className={`h-1.5 ${cfg.bar}`} />

                      <div className="p-5 flex-1 flex flex-col">
                        {/* Number + icon */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            Module {mod.number}
                          </span>
                          <div className="w-7 h-7 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                            <CategoryIcon className="w-3.5 h-3.5 text-gray-500" />
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                          {mod.title}
                        </h3>
                        <p className="text-[11px] text-gray-400 leading-relaxed flex-1">{mod.subtitle}</p>

                        {/* Meta */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                          <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="text-[11px] text-gray-400">{mod.totalDuration}</span>
                          <span className="text-gray-200">·</span>
                          <BookOpen className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="text-[11px] text-gray-400">{mod.lessons.length} lessons</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-500 ml-auto transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
