"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Leaf, Chrome, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Suspense } from "react";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") === "ngo" ? "ngo" : "donor";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const donorPerks = [
    "Real-time fund tracking dashboard",
    "Milestone completion notifications",
    "Blockchain-verified receipts",
    "Impact stories from NGOs you fund",
  ];

  const ngoPerks = [
    "For US-based 501(c)(3) nonprofits only",
    "Create milestone-based projects",
    "Access verified US donor pool",
    "Automatic fund release on milestone completion",
    "On-chain disbursement records",
  ];

  const perks = role === "ngo" ? ngoPerks : donorPerks;
  const title = role === "ngo" ? "Register your NGO" : "Start your giving journey";
  const subtitle =
    role === "ngo"
      ? "For US-based 501(c)(3) nonprofits. Join verified NGOs already receiving milestone-based funding."
      : "Join thousands of donors making provably transparent donations.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    // 1 — create the account
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: role === "ngo" ? "NGO" : "DONOR",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    // 2 — sign in immediately with the new credentials
    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result?.ok) {
      setError("Account created but sign-in failed. Please go to the login page.");
      return;
    }

    router.push("/auth/redirect");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left — value prop */}
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

        {/* Right — form card */}
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
              <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
                <Link
                  href="/signup"
                  className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
                    role === "donor" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  I am a Donor
                </Link>
                <Link
                  href="/signup?role=ngo"
                  className={`flex-1 text-center py-2 rounded-md text-sm font-medium transition-colors ${
                    role === "ngo" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  I represent an NGO
                </Link>
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">
                {role === "ngo" ? "NGO Registration" : "Create your account"}
              </h1>
              <p className="text-gray-500 text-sm text-center mb-6">
                {role === "ngo" ? "Your account is reviewed within 48 hours." : "Free forever. No credit card required."}
              </p>

              {/* Email/password signup form */}
              <form onSubmit={handleSubmit} className="space-y-4 mb-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (role === "ngo" ? "Create NGO account" : "Create account")}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">or sign up with</span>
                </div>
              </div>

              {/* Google */}
              <Button
                type="button"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: role === "ngo" ? "/auth/redirect?role=NGO" : "/auth/redirect",
                  })
                }
                variant="outline"
                className="w-full h-11 flex items-center justify-center gap-3 border-gray-200 hover:bg-gray-50"
              >
                <Chrome className="w-5 h-5 text-red-500" />
                <span className="font-medium">Continue with Google</span>
              </Button>

              {role === "ngo" && (
                <div className="mt-4 bg-amber-50 rounded-lg p-3 text-xs text-amber-800 leading-relaxed space-y-1">
                  <p><strong>US-based 501(c)(3) nonprofits only.</strong> GiveLedger is currently available for registered US nonprofits with a valid EIN.</p>
                  <p><strong>Approval process:</strong> After signing up, our team reviews your registration within 48 hours before your account is activated.</p>
                </div>
              )}

              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-700 font-medium hover:underline">
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
