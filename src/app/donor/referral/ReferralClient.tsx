"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Share2, Copy, Check, MessageCircle, Linkedin, Mail,
  Users, TrendingUp,
} from "lucide-react";

type ReferralRecord = {
  id: string;
  referredName: string | null;
  converted: boolean;
  createdAt: Date;
};

export default function ReferralClient({
  referralCode,
  referrals,
}: {
  referralCode: string;
  referrals: ReferralRecord[];
}) {
  const [copied, setCopied] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://give-ledger.vercel.app";
  const referralUrl = `${appUrl}/signup?ref=${referralCode}`;
  const converted = referrals.filter((r) => r.converted);

  function timeLabel(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const msg = `I've been donating through GiveLedger — every donation is milestone-locked and recorded on the blockchain. You can actually see where your money goes. Check it out: ${referralUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`, "_blank");
  };

  const shareEmail = () => {
    const subject = "Transparent giving — every donation tracked on-chain";
    const body = `Hey,\n\nI've been using GiveLedger to donate to NGOs. What makes it different: every donation is milestone-locked — funds only release when NGOs prove their work with evidence. It's all recorded on the Polygon blockchain.\n\nThought you'd want to check it out: ${referralUrl}\n\nLet me know if you have questions!`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invite Friends</h1>
        <p className="text-gray-500 text-sm mt-1">
          When someone you refer makes their first donation, you both get a $10 platform credit toward your next donation.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <p className="text-3xl font-bold text-gray-900">{referrals.length}</p>
            <p className="text-xs text-gray-500 mt-1">People invited</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-3xl font-bold text-emerald-600">{converted.length}</p>
            <p className="text-xs text-gray-500 mt-1">Converted donors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-3xl font-bold text-purple-600">${converted.length * 10}</p>
            <p className="text-xs text-gray-500 mt-1">Credits earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral link */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-600" />
            Your Referral Link
          </h2>

          <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 p-3 mb-5">
            <p className="text-sm font-mono text-gray-700 flex-1 truncate">{referralUrl}</p>
            <Button size="sm" variant="outline" onClick={copyLink} className="gap-1.5 flex-shrink-0">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <p className="text-xs text-gray-500 mb-4">Share via</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={shareWhatsApp}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-colors"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">WhatsApp</span>
            </button>

            <button
              onClick={shareLinkedIn}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">LinkedIn</span>
            </button>

            <button
              onClick={shareEmail}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">Email</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Share your link", desc: "Send your unique referral link to friends, family, or your network." },
              { step: "2", title: "They sign up & donate", desc: "When they create an account and make their first donation using your link." },
              { step: "3", title: "Both of you earn $10 credit", desc: "A $10 credit is added to both your accounts for future donations." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-bold text-emerald-700 flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            Your Referrals
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {referrals.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No referrals yet — share your link to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {r.referredName ? r.referredName[0].toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.referredName ?? "Anonymous"}</p>
                      <p className="text-xs text-gray-400">Invited {timeLabel(r.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.converted ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Donated
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                    {r.converted && (
                      <span className="text-xs font-bold text-purple-700">+$10</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
