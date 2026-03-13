"use client";

import dynamic from "next/dynamic";

// Dynamic import with ssr:false lives here in a client component,
// which is the only place Next.js App Router allows it.
const GiveLedgerAssistant = dynamic(
  () => import("@/components/GiveLedgerAssistant"),
  { ssr: false }
);

export default function AssistantPortal({ role }: { role: "donor" | "ngo" | "admin" }) {
  return <GiveLedgerAssistant role={role} />;
}
