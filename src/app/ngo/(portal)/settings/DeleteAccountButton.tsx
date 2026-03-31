"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ngo/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to delete account. Try again.");
        setLoading(false);
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <Button
        variant="outline"
        className="text-red-600 border-red-200 hover:bg-red-50 w-full"
        onClick={() => setConfirming(true)}
      >
        Delete Account
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
      <p className="text-sm font-semibold text-red-800">Are you sure?</p>
      <p className="text-xs text-red-700">
        This will permanently delete your NGO account, all projects, milestones, and uploaded documents.
        This cannot be undone.
      </p>
      {error && <p className="text-xs text-red-700 font-medium">{error}</p>}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => { setConfirming(false); setError(""); }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting…" : "Yes, delete everything"}
        </Button>
      </div>
    </div>
  );
}
