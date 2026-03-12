"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Leaf, Chrome, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";

function SignupContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "ngo" ? "ngo" : "donor";

  const donorPerks = [
    "Real-time fund tracking dashboard",
    "Milestone completion notifications",
    "Blockchain-verified receipts",
    "Impact stories from NGOs you fund",
  ];

  const ngoPerks = [
    "Create milestone-based projects",
    "Access verified donor pool",
    "On-chain disbursement records",
    "Impact reporting tools",
  ];

  const perks = role === "ngo" ? ngoPerks : donorPerks;
  const title = role === "ngo" ? "Register your NGO" : "Start your giving journey";
  const subtitle =
    role === "ngo"
      ? "Join 48 verified NGOs already receiving milestone-based funding."
      : "Join thousands of donors making provably transparent donations.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left - value prop */}
        <div className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold text-2xl mb-8">
            <Leaf className="w-7 h-7" />
            GiveLedger
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-500 mb-8">{subtitle}</p>
          <div className="space-y-4">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="text-gray-700">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right - auth card */}
        <div>
          <div className="text-center mb-6 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold text-xl">
              <Leaf className="w-6 h-6" />
              GiveLedger
            </Link>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              {/* Role toggle */}
              <div className="flex rounded-lg bg-gray-100 p-1 mb-8">
                <Link
                  href="/signup"
                  className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
                    role === "donor"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  I am a Donor
                </Link>
                <Link
                  href="/signup?role=ngo"
                  className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
                    role === "ngo"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  I represent an NGO
                </Link>
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">
                {role === "ngo" ? "NGO Registration" : "Create your account"}
              </h1>
              <p className="text-gray-500 text-sm text-center mb-8">
                {role === "ngo"
                  ? "Start by signing in - you will complete your NGO profile next."
                  : "Free forever. No credit card required."}
              </p>

              <Button
                onClick={() =>
                  signIn("google", {
                    callbackUrl: role === "ngo" ? "/auth/redirect?role=NGO" : "/auth/redirect",
                  })
                }
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-3 border-gray-200 hover:bg-gray-50"
              >
                <Chrome className="w-5 h-5 text-red-500" />
                <span className="font-medium">
                  {role === "ngo"
                    ? "Continue with Google"
                    : "Sign up with Google"}
                </span>
              </Button>

              {role === "ngo" && (
                <div className="mt-6 bg-amber-50 rounded-lg p-4 text-xs text-amber-800 leading-relaxed">
                  <strong>NGO Approval Process:</strong> After signing up, our team
                  reviews your registration documents within 48 hours before your
                  account is activated.
                </div>
              )}

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-emerald-700 font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}
