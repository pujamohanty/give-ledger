"use client";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Leaf, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Shield, Award, TrendingUp } from "lucide-react";

// Map NextAuth error codes to human-readable messages
const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignin:     "Incorrect email or password. Please try again.",
  OAuthAccountNotLinked: "This email is already registered with a different sign-in method. Try signing in with Google.",
  OAuthSignin:           "Could not sign in with Google. Please try again.",
  OAuthCallback:         "Google sign-in was cancelled or failed. Please try again.",
  SessionRequired:       "Please sign in to continue.",
  Default:               "Something went wrong. Please try again.",
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [formError, setFormError]       = useState("");

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
      const code = result?.error ?? "Default";
      setFormError(AUTH_ERRORS[code] ?? AUTH_ERRORS.Default);
      return;
    }

    window.location.href = "/auth/redirect";
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (dark) ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#052e16] text-white flex-col justify-between px-12 py-10 relative overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)", backgroundSize: "28px 28px" }}
        />
        <div className="relative z-10">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-white text-lg">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            GiveLedger
          </Link>
        </div>

        {/* Middle content */}
        <div className="relative z-10">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">Welcome back</p>
          <h2 className="text-3xl font-extrabold leading-tight mb-5">
            Every credential.<br />Every hour. Every dollar.<br />
            <span className="text-emerald-400">Permanently on-chain.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
            Your verified contribution record is waiting. Sign in to continue building
            your GiveLedger credential and track every engagement in real time.
          </p>

          <div className="space-y-4">
            {[
              { icon: Award,       text: "NGO-verified credentials, formatted for LinkedIn and CV" },
              { icon: Shield,      text: "Every fund release and skill engagement recorded on Polygon" },
              { icon: TrendingUp,  text: "Monetary value assigned to every hour you contribute" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-sm text-gray-300 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust bar */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-xs text-gray-400">US-based 501(c)(3) nonprofits only</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-xs text-gray-400">Blockchain records on Polygon — auditable by anyone</p>
          </div>
        </div>
      </div>

      {/* ── Right panel (white) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        {/* Mobile logo */}
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-emerald-700 text-lg mb-10 lg:hidden">
          <div className="w-7 h-7 bg-emerald-700 rounded-lg flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-white" />
          </div>
          GiveLedger
        </Link>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-8">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-emerald-700 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>

          {/* Google */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/auth/redirect" })}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-6"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">or sign in with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <span className="text-xs text-gray-400 cursor-default">Forgot password?</span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 rounded-xl border border-gray-200 px-4 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {displayError && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Registering as an NGO?{" "}
            <Link href="/signup?role=ngo" className="text-emerald-600 hover:underline font-medium">
              Apply here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
