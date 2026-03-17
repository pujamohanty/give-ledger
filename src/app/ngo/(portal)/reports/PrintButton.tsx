"use client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PrintButton() {
  return (
    <Button variant="outline" className="flex items-center gap-2 text-sm" onClick={() => window.print()}>
      <Download className="w-4 h-4" /> Export PDF
    </Button>
  );
}
