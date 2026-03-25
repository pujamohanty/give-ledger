import { Metadata } from "next";
import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import IrsDirectoryClient from "./IrsDirectoryClient";

export const metadata: Metadata = {
  title: "IRS Nonprofit Directory — GiveLedger",
  description:
    "Browse 1.8 million US tax-exempt organizations. Search by name, state, category, and financial data.",
};

export default async function IrsDirectoryPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar session={session} />
      <IrsDirectoryClient />
    </div>
  );
}
