import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  Leaf, CheckCircle2,
  // Donor icons
  Search, BookOpen, User, Rss,
  // NGO icons
  Building2, FolderPlus, Users, BarChart3,
} from "lucide-react";

// ─── Shared card component ────────────────────────────────────────────────────
function StepCard({
  href,
  icon,
  iconBg,
  borderHover,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  borderHover: string;
  title: string;
  description: string;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-start gap-4 px-5 py-4 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] ${borderHover} transition-all`}
    >
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
        {badge && <div className="mt-2.5">{badge}</div>}
      </div>
      <span className="text-gray-600 group-hover:text-white transition-colors text-lg leading-none mt-0.5 shrink-0">
        →
      </span>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function WelcomePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isNgo = session.user.role === "NGO";
  const dashboardHref = isNgo ? "/ngo/dashboard" : "/donor/dashboard";
  const firstName = session.user.name?.split(" ")[0] ?? "there";

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
        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>

        {/* Checkmark */}
        <div className="w-[68px] h-[68px] rounded-full bg-emerald-700 flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/50">
          <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>

        {/* Heading + subtitle — different per role */}
        <h1 className="text-[2.5rem] font-bold text-white leading-tight mb-3 text-center">
          You&apos;re in{firstName !== "there" ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-gray-400 text-center text-[15px] max-w-[400px] leading-relaxed mb-10">
          {isNgo
            ? "Your NGO account is ready. Set up your profile and start raising milestone-locked funding."
            : "Your account is ready. Here\u2019s what to do while you wait for NGO responses."}
        </p>

        {/* Cards */}
        <div className="w-full max-w-[440px]">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-600 uppercase mb-4">
            Recommended next steps
          </p>

          <div className="space-y-2.5">
            {isNgo ? (
              // ── NGO steps ────────────────────────────────────────────────
              <>
                <StepCard
                  href="/ngo/org-profile"
                  icon={<Building2 className="w-5 h-5 text-emerald-400" />}
                  iconBg="bg-emerald-500/15"
                  borderHover="hover:border-emerald-500/50"
                  title="Complete your NGO profile"
                  description="Add your organisation description, EIN, state, founder bios, and logo so donors can trust you."
                />
                <StepCard
                  href="/ngo/projects/new"
                  icon={<FolderPlus className="w-5 h-5 text-amber-400" />}
                  iconBg="bg-amber-500/15"
                  borderHover="hover:border-amber-500/50"
                  title="Create your first project"
                  description="Define your goal, set milestones with fund release amounts, and go live to attract donors."
                  badge={
                    <div className="inline-flex items-center bg-amber-500/20 rounded-lg px-3 py-1.5">
                      <span className="text-[11px] text-amber-300 leading-relaxed">
                        Funds only release when milestones are verified · On-chain proof
                      </span>
                    </div>
                  }
                />
                <StepCard
                  href="/ngo/roles/new"
                  icon={<Users className="w-5 h-5 text-violet-400" />}
                  iconBg="bg-violet-500/15"
                  borderHover="hover:border-violet-500/50"
                  title="Post an open role"
                  description="Attract skilled professionals — marketers, engineers, lawyers — who contribute for free in exchange for a verified credential."
                />
                <StepCard
                  href="/"
                  icon={<Rss className="w-5 h-5 text-sky-400" />}
                  iconBg="bg-sky-500/15"
                  borderHover="hover:border-sky-500/50"
                  title="Explore the activity feed"
                  description="See donations, milestones, and skill contributions happening across the platform right now."
                />
              </>
            ) : (
              // ── Donor steps ───────────────────────────────────────────────
              <>
                <StepCard
                  href="/opportunities"
                  icon={<Search className="w-5 h-5 text-emerald-400" />}
                  iconBg="bg-emerald-500/15"
                  borderHover="hover:border-emerald-500/50"
                  title="Browse open roles"
                  description="Find roles that match your skills and apply to contribute professionally."
                />
                <StepCard
                  href="/donor/training"
                  icon={<BookOpen className="w-5 h-5 text-violet-400" />}
                  iconBg="bg-violet-500/15"
                  borderHover="hover:border-violet-500/50"
                  title="Start the AI Training Academy"
                  description="Free 42+ hour curriculum — upskill while you wait for responses."
                  badge={
                    <div className="inline-flex items-center bg-violet-500/20 rounded-lg px-3 py-1.5">
                      <span className="text-[11px] text-violet-300 leading-relaxed">
                        80+ lessons · $2,500 market value · No coding required
                      </span>
                    </div>
                  }
                />
                <StepCard
                  href="/donor/profile"
                  icon={<User className="w-5 h-5 text-emerald-400" />}
                  iconBg="bg-emerald-500/15"
                  borderHover="hover:border-emerald-500/50"
                  title="Complete your profile"
                  description="Add your skills, experience, and links to stand out to NGOs."
                />
                <StepCard
                  href="/"
                  icon={<Rss className="w-5 h-5 text-sky-400" />}
                  iconBg="bg-sky-500/15"
                  borderHover="hover:border-sky-500/50"
                  title="Explore the activity feed"
                  description="See donations, milestones, and skill contributions happening right now."
                />
              </>
            )}
          </div>
        </div>

        {/* Skip */}
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
