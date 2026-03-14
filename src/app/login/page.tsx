"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Leaf, Chrome, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result?.ok) {
      setError("Incorrect email or password. Please try again.");
      return;
    }

    router.push("/auth/redirect");
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

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
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
