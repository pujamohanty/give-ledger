import Link from "next/link";
import Navbar from "@/components/Navbar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, Zap, Crown, Briefcase, GraduationCap, BookOpen, Clock, ArrowRight, Smartphone } from "lucide-react";
import { MODULE_COUNT, TOTAL_LESSONS, TOTAL_HOURS } from "@/lib/training-curriculum";
import SubscribeButton from "@/components/SubscribeButton";

export default async function PricingPage() {
  const session = await auth();

  // Find current plan if logged in as donor
  let currentPlan: string | null = null;
  if (session?.user?.role === "DONOR") {
    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    });
    currentPlan = sub?.plan ?? "FREE";
  }

  const plans = [
    {
      key: "FREE",
      name: "Free",
      price: "$0",
      tagline: "Explore what's possible",
      icon: Briefcase,
      color: "border-gray-200",
      headerBg: "bg-gray-50",
      iconColor: "text-gray-500",
      features: [
        "Browse all open roles",
        "View full role details",
        "See NGO profiles and leadership",
        "View your public GiveLedger credential",
        "AI Training Academy — 42+ hours included",
      ],
      locked: ["Apply to roles", "Reviewed after PRO and BASIC applicants"],
      cta: null,
      badge: null,
    },
    {
      key: "BASIC",
      name: "Basic",
      price: "$10",
      tagline: "One-time · Apply to 50 roles",
      icon: Zap,
      color: "border-emerald-300",
      headerBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      features: [
        "Everything in Free",
        "Apply to up to 50 open roles",
        "Submit cover notes to NGOs",
        "Full engagement tracking",
        "GiveLedger Credential on completion",
        "AI Training Academy — 42+ hours free",
      ],
      locked: [],
      cta: "BASIC" as const,
      badge: null,
    },
    {
      key: "PRO",
      name: "Pro",
      price: "$25",
      tagline: "One-time · Unlimited + Priority",
      icon: Crown,
      color: "border-violet-400",
      headerBg: "bg-violet-50",
      iconColor: "text-violet-600",
      features: [
        "First in every NGO's review queue",
        "Everything in Basic",
        "Unlimited applications",
        "Priority listing in NGO applicant view",
        "PRO badge visible to NGOs",
        "Beta Tester & UGC Creator Program — earn from brand campaigns",
        "AI Training Academy — 42+ hours included",
      ],
      locked: [],
      cta: "PRO" as const,
      badge: "Most popular",
    },
  ];

  return (
    <>
      <Navbar session={session} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Free plan donors are reviewed last.<br />
            <span className="text-violet-700">PRO contributors are reviewed first.</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Your plan position is permanent in every NGO&apos;s review queue. Every role you apply for, every application
            you submit — PRO plan contributors are shown to the NGO before FREE plan applicants. That advantage compounds every time you apply.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.key || (plan.key === "FREE" && !currentPlan);
            return (
              <div
                key={plan.key}
                className={`relative bg-white rounded-2xl border-2 ${plan.color} flex flex-col overflow-hidden`}
              >
                {plan.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className={`${plan.headerBg} px-6 py-5`}>
                  <plan.icon className={`w-6 h-6 ${plan.iconColor} mb-2`} />
                  <p className="text-lg font-bold text-gray-900">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                    {plan.key !== "FREE" && (
                      <span className="text-xs text-gray-400 font-medium">one-time</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{plan.tagline}</p>
                </div>

                {/* Features */}
                <div className="px-6 py-5 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">{f}</span>
                    </div>
                  ))}
                  {plan.locked.map((f) => (
                    <div key={f} className="flex items-start gap-2 opacity-40">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-500 line-through">{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  {isCurrentPlan ? (
                    <div className="w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 bg-gray-50">
                      Current plan
                    </div>
                  ) : plan.cta ? (
                    session?.user ? (
                      <SubscribeButton
                        plan={plan.cta}
                        label={plan.key === "PRO" ? "Get reviewed first — upgrade to PRO" : `Get ${plan.name}`}
                        className={`w-full ${plan.key === "PRO" ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-emerald-700 hover:bg-emerald-800 text-white"}`}
                      />
                    ) : (
                      <Link
                        href={`/login?callbackUrl=/pricing`}
                        className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${plan.key === "PRO" ? "bg-violet-600 hover:bg-violet-700" : "bg-emerald-700 hover:bg-emerald-800"}`}
                      >
                        {plan.key === "PRO" ? "Get reviewed first — upgrade to PRO" : `Sign in to get ${plan.name}`}
                      </Link>
                    )
                  ) : (
                    <Link
                      href="/opportunities"
                      className="block w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Browse roles
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Training Academy callout */}
        <div className="mt-14 bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl p-8 text-white">
          <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold text-emerald-100 mb-3">
                <GraduationCap className="w-3.5 h-3.5" />
                Included free with every account
              </div>
              <h2 className="text-2xl font-extrabold mb-2">AI Training Academy</h2>
              <p className="text-emerald-100 text-sm leading-relaxed max-w-lg">
                Every donor gets free access to our complete AI training programme — from first install
                to advanced business automation. No coding experience required.
              </p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-center shrink-0">
              <p className="text-3xl font-extrabold text-white">$2,500</p>
              <p className="text-emerald-200 text-xs mt-1">Estimated market value</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-300 mt-1">Yours free</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: BookOpen, value: MODULE_COUNT, label: "Modules" },
              { icon: Clock,    value: TOTAL_HOURS,  label: "Hours"   },
              { icon: Zap,      value: TOTAL_LESSONS, label: "Lessons" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-center">
                <Icon className="w-4 h-4 text-emerald-300 mx-auto mb-1" />
                <p className="text-xl font-extrabold">{value}</p>
                <p className="text-[11px] text-emerald-200">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-2 mb-6">
            {[
              "Claude Code from zero — no coding background needed",
              "Marketing: grant proposals, donor emails, social campaigns",
              "Finance: budgets, forecasts, audit-ready expense reports",
              "Operations: SOPs, vendor contracts, risk registers",
              "HR: job descriptions, onboarding guides, policies",
              "Legal: compliance checklists, FOIA templates, bylaws",
              "Data & Impact: dashboards, outcome reports, funder decks",
              "Advanced: automated pipelines, multi-agent workflows",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                <span className="text-xs text-emerald-100">{f}</span>
              </div>
            ))}
          </div>

          <Link
            href="/donor/training"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Explore the curriculum <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Beta Tester & UGC Program callout — PRO only */}
        <div className="mt-8 bg-gradient-to-br from-violet-700 to-purple-800 rounded-3xl p-8 text-white">
          <div className="flex items-start justify-between gap-6 flex-wrap mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-semibold text-violet-100 mb-3">
                <Crown className="w-3.5 h-3.5" />
                Exclusive to Pro plan
              </div>
              <h2 className="text-2xl font-extrabold mb-2">Beta Tester & UGC Creator Program</h2>
              <p className="text-violet-100 text-sm leading-relaxed max-w-lg">
                Pro members get access to our brand campaign platform where companies pay you to test
                their apps before launch and post authentic content to your social channels.
                Every campaign is matched to your devices, niches, and reach.
              </p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-center shrink-0">
              <p className="text-3xl font-extrabold text-white">+Income</p>
              <p className="text-violet-200 text-xs mt-1">Earn per campaign</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-300 mt-1">PRO exclusive</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-2 mb-6">
            {[
              "Test apps before they hit the App Store or Google Play",
              "Post honest UGC reviews across your social channels",
              "Get matched by device — iOS, Android, Mac, Windows",
              "Campaigns matched to your content niche and audience",
              "Register across Instagram, TikTok, X, YouTube, LinkedIn, Reddit",
              "Campaigns arrive directly — no searching or applying",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-300 shrink-0 mt-0.5" />
                <span className="text-xs text-violet-100">{f}</span>
              </div>
            ))}
          </div>

          <Link
            href="/donor/beta-program"
            className="inline-flex items-center gap-2 bg-white text-violet-700 hover:bg-violet-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Register for the program <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* FAQ */}
        <div className="mt-14 max-w-2xl mx-auto">
          <h2 className="text-sm font-semibold text-gray-900 mb-6 text-center">Common questions</h2>
          <div className="space-y-5">
            {[
              {
                q: "Why is there a fee to apply?",
                a: "The fee reflects the value you receive — verified, credentialed professional experience with real NGOs. Think of it as an investment in your career, not a cost of volunteering.",
              },
              {
                q: "What counts as an application toward the Basic limit?",
                a: "Each cover note you submit to an NGO counts as one application. Withdrawing an application does not restore your count.",
              },
              {
                q: "Can I upgrade from Basic to Pro?",
                a: "Yes. Purchase the Pro plan at any time and your plan upgrades immediately. Your previous applications still count toward your credential.",
              },
              {
                q: "What happens to my credentials if I downgrade from PRO to FREE?",
                a: "Your credentials, Impact Score, and on-chain records are permanent — they never disappear regardless of plan. The plan only affects your queue position for future applications.",
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="text-sm font-semibold text-gray-900 mb-1">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
