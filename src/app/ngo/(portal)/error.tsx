"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NgoPortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[NgoPortal Error]", error.message, error.digest, error.stack);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-2">
          An error occurred while loading your portal.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-gray-400 mb-6">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Try again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">Back to home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
