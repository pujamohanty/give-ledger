"use client";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Leaf, Chrome, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Map NextAuth error codes to human-readable messages
const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignin:       "Incorrect email or password. Please try again.",
  OAuthAccountNotLinked:   "This email is already registered with a different sign-in method. Try signing in with Google.",
  OAuthSignin:             "Could not sign in with Google. Please try again.",
  OAuthCallback:           "Google sign-in was cancelled or failed. Please try again.",
  SessionRequired:         "Please sign in to continue.",
  Default:                 "Something went wrong. Please try again.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Show URL-level auth errors (from NextAuth's server-side redirect)
  const displayError = formError || (urlError ? (AUTH_ERRORS[urlError] ?? AUTH_ERRORS.Default) : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result?.ok) {
      // Map the error code to a friendly message
      const code = result?.error ?? "Default";
      setFormError(AUTH_ERRORS[code] ?? AUTH_ERRORS.Default);
      return;
    }

    // Credentials verified — do a full browser navigation so the new
    // JWT cookie is sent with the next request (bypasses Next.js router cache)
    window.location.href = "/auth/redirect";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold text-2xl mb-2">
            <Leaf className="w-7 h-7" />
            GiveLedger
          </Link>
          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">Welcome back</h1>

            {/* Email/password form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
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

              {displayError && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{displayError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">or continue with</span>
              </div>
            </div>

            {/* Google */}
            <Button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/auth/redirect" })}
              variant="outline"
              className="w-full h-11 flex items-center justify-center gap-3 border-gray-200 hover:bg-gray-50"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              <span className="font-medium">Continue with Google</span>
            </Button>

            <p className="text-center text-sm text-gray-500 mt-6">
              New to GiveLedger?{" "}
              <Link href="/signup" className="text-emerald-700 font-medium hover:underline">
                Create account
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          Registering as an NGO?{" "}
          <Link href="/signup?role=ngo" className="text-emerald-600 hover:underline">
            Apply here
          </Link>
        </p>
      </div>
    </div>
  );
}

// Suspense wrapper is required by Next.js when useSearchParams is used in a page
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
