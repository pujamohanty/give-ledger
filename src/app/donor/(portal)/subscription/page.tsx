import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Zap, Briefcase, CheckCircle2, ChevronRight } from "lucide-react";
import SubscribeButton from "@/components/SubscribeButton";

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { upgraded } = await searchParams;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: {
      plan: true,
      applicationsUsed: true,
      purchasedAt: true,
    },
  });

  const plan = subscription?.plan ?? "FREE";
  const appsUsed = subscription?.applicationsUsed ?? 0;

  const planMeta = {
    FREE: {
      label: "Free",
      icon: Briefcase,
      iconColor: "text-gray-500",
      bg: "bg-gray-100",
      badge: "bg-gray-100 text-gray-600",
    },
    BASIC: {
      label: "Basic",
      icon: Zap,
      iconColor: "text-emerald-600",
      bg: "bg-emerald-50",
      badge: "bg-emerald-100 text-emerald-700",
    },
    PRO: {
      label: "Pro",
      icon: Crown,
      iconColor: "text-violet-600",
      bg: "bg-violet-50",
      badge: "bg-violet-100 text-violet-700",
    },
  } as const;

  const meta = planMeta[plan as keyof typeof planMeta];

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Subscription</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your Open Roles access plan.</p>
      </div>

      {upgraded && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Plan upgraded successfully — you can now apply to open roles.
        </div>
      )}

      {/* Current plan card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <meta.icon className={`w-4 h-4 ${meta.iconColor}`} />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${meta.bg} rounded-xl flex items-center justify-center`}>
                <meta.icon className={`w-5 h-5 ${meta.iconColor}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{meta.label}</p>
                {plan === "FREE" && <p className="text-xs text-gray-400">Browse only — upgrade to apply</p>}
                {plan === "BASIC" && <p className="text-xs text-gray-400">Up to 50 applications</p>}
                {plan === "PRO" && <p className="text-xs text-gray-400">Unlimited applications · Priority</p>}
              </div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${meta.badge}`}>
              {meta.label}
            </span>
          </div>

          {plan === "BASIC" && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Applications used</p>
                <p className="text-sm font-bold text-gray-900">{appsUsed} / 50</p>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${Math.min((appsUsed / 50) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {50 - appsUsed} application{50 - appsUsed !== 1 ? "s" : ""} remaining
              </p>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Upgrade options */}
      {plan !== "PRO" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upgrade your plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan === "FREE" && (
              <div className="border border-emerald-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-emerald-600" /> Basic — $10 one-time
                    </p>
                    <ul className="mt-2 space-y-1">
                      {["Apply to up to 50 open roles", "Submit cover notes to NGOs", "Full engagement tracking"].map((f) => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <SubscribeButton
                    plan="BASIC"
                    label="Get Basic"
                    className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-4"
                  />
                </div>
              </div>
            )}

            <div className="border-2 border-violet-400 rounded-xl p-4 bg-violet-50/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-violet-600" /> Pro — $25 one-time
                  </p>
                  <ul className="mt-2 space-y-1">
                    {[
                      "Unlimited applications",
                      "Priority position in NGO applicant view",
                      "PRO badge visible to NGOs",
                      "Beta Tester & UGC Creator Program access",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <CheckCircle2 className="w-3 h-3 text-violet-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <SubscribeButton
                  plan="PRO"
                  label="Get Pro"
                  className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white text-xs px-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/opportunities" className="hover:text-emerald-700 flex items-center gap-1 transition-colors">
          Browse open roles <ChevronRight className="w-3 h-3" />
        </Link>
        <span>·</span>
        <Link href="/pricing" className="hover:text-emerald-700 transition-colors">
          View full pricing page
        </Link>
      </div>
    </div>
  );
}
