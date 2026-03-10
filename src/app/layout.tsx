import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GiveLedger — Blockchain-Powered Donation Tracking",
  description:
    "Every dollar donated deserves a story — from pledge to proof. GiveLedger makes that story verifiable, shareable, and permanent.",
  keywords: ["donation", "blockchain", "transparency", "NGO", "charity"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
