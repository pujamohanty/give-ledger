"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  plan: "BASIC" | "PRO";
  label: string;
  variant?: "default" | "outline";
  className?: string;
}

export default function SubscribeButton({ plan, label, variant = "default", className }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-skill-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silently fail — button re-enables
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
