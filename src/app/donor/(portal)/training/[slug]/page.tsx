import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  TRAINING_MODULES,
  getModule,
} from "@/lib/training-curriculum";
import CopyPromptButton from "@/components/CopyPromptButton";
import {
  ChevronLeft, ChevronRight, Clock, BookOpen, Zap,
  FolderOpen, Library, CheckCircle2, GraduationCap,
} from "lucide-react";

const levelBadge: Record<string, string> = {
  Beginner:     "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced:     "bg-violet-100 text-violet-700",
};

const typeConfig: Record<string, { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  guide:            { label: "Guide",          color: "bg-sky-50 text-sky-700 border-sky-100",         Icon: BookOpen  },
  exercise:         { label: "Exercise",       color: "bg-amber-50 text-amber-700 border-amber-100",   Icon: Zap       },
  project:          { label: "Project",        color: "bg-violet-50 text-violet-700 border-violet-100",Icon: FolderOpen },
  "prompt-library": { label: "Prompt Library", color: "bg-emerald-50 text-emerald-700 border-emerald-100", Icon: Library },
};

export async function generateStaticParams() {
  return TRAINING_MODULES.map((m) => ({ slug: m.slug }));
}

export default async function TrainingModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();

  const allSlugs = TRAINING_MODULES.map((m) => m.slug);
  const idx      = allSlugs.indexOf(slug);
  const prevMod  = idx > 0 ? TRAINING_MODULES[idx - 1] : null;
  const nextMod  = idx < allSlugs.length - 1 ? TRAINING_MODULES[idx + 1] : null;

  return (
    <div className="min-h-screen bg-[#f3f2ef]">

      {/* Header */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
            <Link href="/donor/training" className="hover:text-emerald-700 flex items-center gap-1 transition-colors">
              <GraduationCap className="w-3.5 h-3.5" />
              AI Training Academy
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 font-medium truncate">{mod.title}</span>
          </div>

          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Module {mod.number} of {TRAINING_MODULES.length}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${levelBadge[mod.level]}`}>
                  {mod.level}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">{mod.title}</h1>
              <p className="text-sm text-gray-500 font-medium mb-3">{mod.subtitle}</p>
              <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">{mod.description}</p>
            </div>

            {/* Duration card */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 text-center shrink-0">
              <Clock className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-lg font-extrabold text-emerald-700">{mod.totalDuration}</p>
              <p className="text-[11px] text-emerald-500">{mod.lessons.length} lessons</p>
            </div>
          </div>

          {/* Learning outcomes */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What you will be able to do</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {mod.outcomes.map((o) => (
                <div key={o} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700">{o}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {mod.lessons.map((lesson, i) => {
          const tc = typeConfig[lesson.type] ?? typeConfig["guide"];
          const TypeIcon = tc.Icon;
          return (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] overflow-hidden"
            >
              {/* Lesson header */}
              <div className="px-6 py-4 border-b border-gray-50 flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold text-gray-400">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-sm font-bold text-gray-900">{lesson.title}</h2>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tc.color}`}>
                      <TypeIcon className="w-2.5 h-2.5" />
                      {tc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    {lesson.duration}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{lesson.description}</p>

                {/* Key points */}
                {lesson.keyPoints.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {lesson.keyPoints.map((kp) => (
                      <div key={kp} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        <span className="text-xs text-gray-600 leading-relaxed">{kp}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Example prompt */}
                {lesson.examplePrompt && (
                  <div className="bg-gray-950 rounded-xl p-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                        Example prompt — copy and use in Claude Code
                      </span>
                      <CopyPromptButton prompt={lesson.examplePrompt} />
                    </div>
                    <p className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                      {lesson.examplePrompt}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next nav */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-2 gap-4">
          {prevMod ? (
            <Link
              href={`/donor/training/${prevMod.slug}`}
              className="flex items-center gap-3 bg-white border border-[rgba(0,0,0,0.08)] hover:border-emerald-300 rounded-2xl px-5 py-4 transition-all group"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Previous</p>
                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                  {prevMod.title}
                </p>
              </div>
            </Link>
          ) : <div />}

          {nextMod ? (
            <Link
              href={`/donor/training/${nextMod.slug}`}
              className="flex items-center gap-3 bg-white border border-[rgba(0,0,0,0.08)] hover:border-emerald-300 rounded-2xl px-5 py-4 transition-all group text-right justify-end"
            >
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Next</p>
                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                  {nextMod.title}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 shrink-0" />
            </Link>
          ) : <div />}
        </div>

        <div className="text-center mt-6">
          <Link href="/donor/training" className="text-xs text-gray-400 hover:text-emerald-700 transition-colors">
            Back to all modules
          </Link>
        </div>
      </div>
    </div>
  );
}
