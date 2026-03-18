import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Leaf, Search, BookOpen, User, Rss, CheckCircle2 } from "lucide-react";

export default async function WelcomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const isNgo = session.user.role === "NGO";
  const dashboardHref = isNgo ? "/ngo/dashboard" : "/donor/dashboard";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-white" />
          </div>
          GiveLedger
        </Link>
        <Link
          href={dashboardHref}
          className="text-sm text-gray-500 hover:text-white transition-colors"
        >
          Already have an account?{" "}
          <span className="text-emerald-400 font-semibold">Go to dashboard</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Progress dots — all filled (account ready) */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>

        {/* Checkmark */}
        <div className="w-[68px] h-[68px] rounded-full bg-emerald-700 flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/50">
          <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>

        {/* Heading */}
        <h1 className="text-[2.5rem] font-bold text-white leading-tight mb-3">
          You&apos;re in{firstName !== "there" ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-gray-400 text-center text-[15px] max-w-[380px] leading-relaxed mb-10">
          Your account is ready. Here&apos;s what to do while you wait for NGO
          responses.
        </p>

        {/* Cards */}
        <div className="w-full max-w-[440px]">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-600 uppercase mb-4">
            Recommended next steps
          </p>

          <div className="space-y-2.5">
            {/* Browse open roles */}
            <Link
              href="/opportunities"
              className="group flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-emerald-500/50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">Browse open roles</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Find roles that match your skills and apply
                </p>
              </div>
              <span className="text-gray-600 group-hover:text-white transition-colors text-lg leading-none">
                →
              </span>
            </Link>

            {/* AI Training */}
            <Link
              href="/donor/training"
              className="group flex items-start gap-4 px-5 py-4 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-violet-500/50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">
                  Start the AI Training Academy
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Free 42+ hour curriculum — upskill while you wait for responses
                </p>
                <div className="mt-2.5 inline-flex items-center bg-violet-500/20 rounded-lg px-3 py-1.5">
                  <span className="text-[11px] text-violet-300 leading-relaxed">
                    80+ lessons · $2,500 market value · No coding required
                  </span>
                </div>
              </div>
              <span className="text-gray-600 group-hover:text-white transition-colors text-lg leading-none mt-0.5">
                →
              </span>
            </Link>

            {/* Complete profile */}
            <Link
              href="/donor/profile"
              className="group flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-emerald-500/50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">
                  Complete your profile
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add your skills, experience, and links to stand out
                </p>
              </div>
              <span className="text-gray-600 group-hover:text-white transition-colors text-lg leading-none">
                →
              </span>
            </Link>

            {/* Activity feed */}
            <Link
              href="/wall"
              className="group flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-sky-500/50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-500/15 flex items-center justify-center shrink-0">
                <Rss className="w-5 h-5 text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">
                  Explore the activity feed
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  See donations, milestones, and skill contributions happening right now
                </p>
              </div>
              <span className="text-gray-600 group-hover:text-white transition-colors text-lg leading-none">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Skip link */}
        <Link
          href={dashboardHref}
          className="mt-10 text-xs text-gray-700 hover:text-gray-400 transition-colors"
        >
          Skip — go straight to my dashboard →
        </Link>
      </main>
    </div>
  );
}
