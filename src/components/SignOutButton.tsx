"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors w-full"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}
