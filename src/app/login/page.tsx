"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Leaf, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold text-2xl mb-2">
            <Leaf className="w-7 h-7" />
            GiveLedger
          </Link>
          <p className="text-gray-500 text-sm mt-2">
            Sign in to your account
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">Welcome back</h1>
            <p className="text-gray-500 text-sm text-center mb-8">
              Track your donations, view impact, and more.
            </p>

            <Button
              onClick={() => signIn("google", { callbackUrl: "/auth/redirect" })}
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-3 border-gray-200 hover:bg-gray-50 mb-4"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              <span className="font-medium">Continue with Google</span>
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">secure sign-in</span>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <p className="text-emerald-800 text-xs leading-relaxed">
                By signing in, you agree to GiveLedger&apos;s{" "}
                <span className="underline cursor-pointer">Terms of Service</span> and{" "}
                <span className="underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>

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
