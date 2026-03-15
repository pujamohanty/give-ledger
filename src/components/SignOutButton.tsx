"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface SignOutButtonProps {
  dark?: boolean;
}

export default function SignOutButton({ dark }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
        dark
          ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
      }`}
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}
