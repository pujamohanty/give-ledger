"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Smartphone, Video, CheckCircle2, Loader2, AlertCircle, Pencil,
  Instagram, Twitter, Youtube, Zap, BadgeCheck, TrendingUp,
  Linkedin, Crown, Lock, Calendar, DollarSign, Monitor, Share2,
  X, ArrowRight, Calculator, ChevronRight,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Profile = {
  id: string;
  devices: string[];
  followerRange: string;
  niches: string[];
  instagramHandle: string | null;
  tiktokHandle:    string | null;
  twitterHandle:   string | null;
  youtubeHandle:   string | null;
  linkedinHandle:  string | null;
  redditHandle:    string | null;
  isActive: boolean;
  registeredAt: Date;
};

// ── Option data ────────────────────────────────────────────────────────────────

const DEVICES = [
  { id: "iOS",             label: "iPhone / iPad" },
  { id: "Android",         label: "Android"       },
  { id: "Desktop_Mac",     label: "Mac"           },
  { id: "Desktop_Windows", label: "Windows PC"    },
];

const FOLLOWER_RANGES = [
  { id: "UNDER_1K",  label: "Under 1K",  desc: "Nano"  },
  { id: "1K_10K",    label: "1K – 10K",  desc: "Micro" },
  { id: "10K_50K",   label: "10K – 50K", desc: "Mid"   },
  { id: "50K_PLUS",  label: "50K+",      desc: "Macro" },
];

const NICHES = [
  "Tech & Apps", "Lifestyle", "Finance & Business", "Health & Wellness",
  "Gaming", "Food & Beverage", "Travel", "Fashion & Beauty",
];

const DEVICE_LABELS: Record<string, string> = {
  iOS: "iPhone / iPad", Android: "Android", Desktop_Mac: "Mac", Desktop_Windows: "Windows PC",
};
const FOLLOWER_LABELS: Record<string, string> = {
  UNDER_1K: "Under 1K", "1K_10K": "1K – 10K", "10K_50K": "10K – 50K", "50K_PLUS": "50K+",
};

// ── Reddit icon ────────────────────────────────────────────────────────────────

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  );
}

// ── Multi-select pill ──────────────────────────────────────────────────────────

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
        selected
          ? "bg-violet-600 border-violet-600 text-white"
          : "bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700"
      }`}
    >
      {label}
    </button>
  );
}

// ── Earnings modal ─────────────────────────────────────────────────────────────

function EarningsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tiers = [
    { tier: "Nano",  range: "Under 1K",  perCampaign: "$50 – $80",    mo3: "$150 – $240",   mo5: "$250 – $400"    },
    { tier: "Micro", range: "1K – 10K",  perCampaign: "$70 – $120",   mo3: "$210 – $360",   mo5: "$350 – $600"    },
    { tier: "Mid",   range: "10K – 50K", perCampaign: "$120 – $220",  mo3: "$360 – $660",   mo5: "$600 – $1,100"  },
    { tier: "Macro", range: "50K+",      perCampaign: "$250 – $500+", mo3: "$750 – $1,500+",mo5: "$1,250 – $2,500+"},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="font-bold text-gray-900">How earnings work</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">

          {/* Task flow diagram */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">How a campaign works</p>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-stretch gap-0">
                {[
                  { step: "1", label: "Brand launches campaign", sub: "You get matched based on your devices, niche & reach", color: "bg-violet-100 text-violet-700 border-violet-200" },
                  { step: "2", label: "You complete the tasks", sub: "Beta test the app and/or post content on your channels", color: "bg-blue-100 text-blue-700 border-blue-200" },
                  { step: "3", label: "Brand verifies delivery", sub: "Screenshots, links, or app feedback submitted by you", color: "bg-amber-100 text-amber-700 border-amber-200" },
                  { step: "4", label: "You get paid", sub: "USD payment within 7 days of approval", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                ].map((item, i, arr) => (
                  <div key={item.step} className="flex items-center flex-1 min-w-0">
                    <div className={`flex-1 border rounded-xl p-2.5 min-w-0 ${item.color}`}>
                      <div className="text-[10px] font-extrabold mb-1 opacity-60">STEP {item.step}</div>
                      <p className="text-[11px] font-bold leading-tight mb-1">{item.label}</p>
                      <p className="text-[10px] opacity-70 leading-tight hidden sm:block">{item.sub}</p>
                    </div>
                    {i < arr.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 mx-0.5 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What tasks are paid */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What you get paid for</p>
            <div className="space-y-2">
              {[
                { task: "Beta testing the app", detail: "Download, use for 30–60 min, submit structured feedback form", usd: "$20 – $40" },
                { task: "Creating a UGC post", detail: "One authentic video or post on your social channel", usd: "$30 – $80 per post" },
                { task: "Writing a review", detail: "App Store / Google Play review or written testimonial", usd: "$10 – $20" },
              ].map((t) => (
                <div key={t.task} className="flex items-start justify-between gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{t.task}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{t.detail}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">{t.usd}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2 pl-1">
              Most campaigns combine 2–3 tasks. Total payout per campaign = sum of all tasks completed.
            </p>
          </div>

          {/* Earnings by follower tier */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Monthly earnings by reach</p>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Tier</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-500">Followers</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-gray-500">Per campaign</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-gray-500">3/month</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-gray-500">5/month</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t, i) => (
                    <tr key={t.tier} className={i < tiers.length - 1 ? "border-b border-gray-50" : ""}>
                      <td className="px-3 py-2.5 font-semibold text-gray-700">{t.tier}</td>
                      <td className="px-3 py-2.5 text-gray-500">{t.range}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-gray-800">{t.perCampaign}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600">{t.mo3}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{t.mo5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 pl-1">
              All amounts in USD. Paid within 7 days of brand approval. Campaigns are not guaranteed — availability depends on brand demand and your profile match.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Campaign preview modal ─────────────────────────────────────────────────────

function CampaignPreviewModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-0.5">Sample Campaign</p>
            <h2 className="font-bold text-gray-900">What a real campaign looks like</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Brand card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900">FinTrack App</p>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Beta Testing + UGC</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Test our AI-powered personal finance app before its public launch and post an honest 60-second review to your audience.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-base font-extrabold text-gray-900">$80 – $150</p>
                <p className="text-[10px] text-gray-400">per campaign</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-gray-500">
              <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> iOS &amp; Android</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Rolling — 12 spots</span>
            </div>
          </div>

          {/* Tasks breakdown */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tasks in this campaign</p>
            <div className="space-y-2">
              {[
                { task: "Download & use the app for 45 minutes",     pay: "$25",      icon: "📱" },
                { task: "Complete a structured feedback form (10Qs)", pay: "$15",      icon: "📋" },
                { task: "Post one 60-second review on Instagram",    pay: "$35 – $90", icon: "📸" },
                { task: "Post a TikTok review video (optional)",     pay: "$25 – $60", icon: "🎬" },
              ].map((t) => (
                <div key={t.task} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{t.icon}</span>
                    <p className="text-xs text-gray-700">{t.task}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-emerald-700">{t.pay}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How you get paid */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">How payment works</p>
            <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <p>You accept the campaign and complete all required tasks within the deadline (usually 5–7 days).</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <p>You submit proof — your social post links and completed feedback form — through the campaign dashboard.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <p>The brand reviews your submission within 3 business days. If approved, payment is sent to your account within 7 days.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">$</span>
                <p><strong>All payments are in USD.</strong> Your total for this example campaign: $80–$150 depending on which optional tasks you complete and your follower tier.</p>
              </div>
            </div>
          </div>

          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-violet-700 leading-relaxed">
            Campaigns like this are matched to your profile once you register. New campaigns are added every week. You only do campaigns you choose to accept.
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Sample campaign (1 card only) ──────────────────────────────────────────────

function CampaignsPreview() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const campaign = {
    brand: "FinTrack App",
    type: "Beta Testing + UGC",
    description: "Test our AI-powered personal finance app (iOS & Android) and post a 60-second honest review to your social channels.",
    device: "iOS / Android",
    payout: "$80 – $150",
    deadline: "Rolling — 12 spots left",
    color: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
  };

  return (
    <>
      {previewOpen && <CampaignPreviewModal onClose={() => setPreviewOpen(false)} />}

      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Available campaigns</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Live campaigns from brand partners — matched to registered members.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="text-[10px] font-bold uppercase tracking-wide bg-amber-50 border border-amber-200 text-amber-600 px-2.5 py-1 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
          >
            Sample preview ↗
          </button>
        </div>

        {/* Single blurred campaign card */}
        <div className={`relative rounded-2xl border ${campaign.color} p-5 overflow-hidden`}>
          {/* Blur overlay — locked */}
          <div className="absolute inset-0 backdrop-blur-[2px] bg-white/40 flex items-center justify-center rounded-2xl z-10">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-2 bg-white/90 border border-gray-200 shadow-sm rounded-full px-4 py-2 hover:bg-white hover:shadow-md transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-semibold text-gray-600">Register to unlock</span>
            </button>
          </div>

          {/* Card content (blurred behind overlay) */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 text-sm">{campaign.brand}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${campaign.badge}`}>
                  {campaign.type}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed max-w-lg">{campaign.description}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-gray-900">{campaign.payout}</p>
              <p className="text-[10px] text-gray-400">per campaign</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Monitor className="w-3 h-3" /> {campaign.device}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {campaign.deadline}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Real campaigns will be matched to your profile once you register. New campaigns added weekly.
        </p>
      </div>
    </>
  );
}

// ── Registered status view ─────────────────────────────────────────────────────

function StatusView({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  const [copied, setCopied] = useState(false);
  const [earningsOpen, setEarningsOpen] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}/donor/beta-program`;
    const text = "I joined GiveLedger's Beta Tester & UGC Creator Program — earn $3,000–$5,000/month testing apps and creating content for brands.";
    if (navigator.share) {
      navigator.share({ title: "Beta Tester & UGC Creator Program", text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n\n${url}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  const registeredDate = new Date(profile.registeredAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const socialHandles = [
    { icon: Instagram,  value: profile.instagramHandle, color: "text-pink-500",   label: "Instagram" },
    { icon: Zap,        value: profile.tiktokHandle,    color: "text-gray-800",   label: "TikTok"    },
    { icon: Twitter,    value: profile.twitterHandle,   color: "text-sky-500",    label: "X"         },
    { icon: Youtube,    value: profile.youtubeHandle,   color: "text-red-500",    label: "YouTube"   },
    { icon: Linkedin,   value: profile.linkedinHandle,  color: "text-blue-600",   label: "LinkedIn"  },
    { icon: RedditIcon, value: profile.redditHandle,    color: "text-orange-500", label: "Reddit"    },
  ].filter((s) => s.value);

  return (
    <>
      {earningsOpen && <EarningsModal onClose={() => setEarningsOpen(false)} />}

      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full">
                Active Member
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Beta Tester & UGC Creator Program</h1>
            <p className="text-gray-500 text-sm mt-1">Member since {registeredDate}</p>
            <button
              type="button"
              onClick={() => setEarningsOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors mt-2"
            >
              <Calculator className="w-3 h-3" /> See earnings breakdown <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${copied ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-800"}`}
            >
              <Share2 className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit preferences
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-violet-600" />
            <p className="font-semibold text-gray-900">You are registered and visible to brands</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            When campaigns are launched on our partner platform, you will be matched with brands based on
            your devices, content niches, reach, and social presence. Campaign invitations will arrive directly.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Devices</p>
            <div className="flex flex-wrap gap-2">
              {profile.devices.map((d) => (
                <span key={d} className="text-sm bg-gray-50 text-gray-700 px-2.5 py-1 rounded-full font-medium border border-gray-100">
                  {DEVICE_LABELS[d] ?? d}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Follower range</p>
            <span className="text-sm bg-gray-50 text-gray-700 px-2.5 py-1 rounded-full font-medium border border-gray-100">
              {FOLLOWER_LABELS[profile.followerRange] ?? profile.followerRange}
            </span>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Content niches</p>
            <div className="flex flex-wrap gap-2">
              {profile.niches.map((n) => (
                <span key={n} className="text-sm bg-gray-50 text-gray-700 px-2.5 py-1 rounded-full font-medium border border-gray-100">
                  {n}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Social handles ({socialHandles.length})
            </p>
            <div className="space-y-2">
              {socialHandles.map(({ icon: Icon, value, color, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-700">
                  <Icon className={`w-4 h-4 ${color} shrink-0`} />
                  <span className="text-gray-400 text-xs w-16 shrink-0">{label}</span>
                  @{value}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Your profile is only shared with vetted brand partners on our campaign platform.
        </p>
      </div>
    </>
  );
}

// ── Sign-up form ───────────────────────────────────────────────────────────────

function SignupForm({
  initial, isPro, onSaved,
}: { initial: Profile | null; isPro: boolean; onSaved: (p: Profile) => void }) {
  const [shareCopied, setShareCopied] = useState(false);
  const [earningsOpen, setEarningsOpen] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}/donor/beta-program`;
    const text = "Earn $3,000–$5,000/month with GiveLedger's Beta Tester & UGC Creator Program — test apps before launch and post content for brands.";
    if (navigator.share) {
      navigator.share({ title: "Beta Tester & UGC Creator Program", text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n\n${url}`).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      });
    }
  }

  const [devices, setDevices]             = useState<string[]>(initial?.devices       ?? []);
  const [followerRange, setFollowerRange] = useState(initial?.followerRange ?? "");
  const [niches, setNiches]               = useState<string[]>(initial?.niches        ?? []);
  const [instagram, setInstagram]         = useState(initial?.instagramHandle ?? "");
  const [tiktok, setTiktok]               = useState(initial?.tiktokHandle    ?? "");
  const [twitter, setTwitter]             = useState(initial?.twitterHandle   ?? "");
  const [youtube, setYoutube]             = useState(initial?.youtubeHandle   ?? "");
  const [linkedin, setLinkedin]           = useState(initial?.linkedinHandle  ?? "");
  const [reddit, setReddit]               = useState(initial?.redditHandle    ?? "");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  const filledHandles = [instagram, tiktok, twitter, youtube, linkedin, reddit]
    .filter((h) => h.trim().length > 0).length;

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!devices.length)   { setError("Please select at least one device."); return; }
    if (!followerRange)    { setError("Please select your follower range."); return; }
    if (!niches.length)    { setError("Please select at least one content niche."); return; }
    if (filledHandles < 3) { setError("Please provide at least 3 social media handles."); return; }

    setLoading(true);
    const res = await fetch("/api/donor/beta-program", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        devices, followerRange, niches,
        instagramHandle: instagram, tiktokHandle: tiktok, twitterHandle: twitter,
        youtubeHandle: youtube, linkedinHandle: linkedin, redditHandle: reddit,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    onSaved(data.profile);
  }

  return (
    <>
      {earningsOpen && <EarningsModal onClose={() => setEarningsOpen(false)} />}

      <div className="max-w-2xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Zap className="w-3.5 h-3.5" /> Earn while you help
            </div>
            <button
              type="button"
              onClick={handleShare}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${shareCopied ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-700"}`}
            >
              <Share2 className="w-3.5 h-3.5" /> {shareCopied ? "Copied!" : "Share"}
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Beta Tester & UGC Creator Program</h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
            Get paid by brands to test their apps before launch and post authentic content across your
            social channels. Campaigns are matched directly to your profile.
          </p>

          {/* Earnings link bar — below description */}
          <div className="flex items-center justify-center mt-3 mb-2">
            <button
              type="button"
              onClick={() => setEarningsOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" /> Wondering how much you can earn? See earnings breakdown <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 text-left">
            {[
              { icon: Smartphone, label: "Test apps first",    desc: "Early access before public launch",         color: "bg-violet-50 text-violet-600"  },
              { icon: Video,      label: "Create UGC content", desc: "Post authentic reviews, earn per campaign", color: "bg-pink-50 text-pink-600"      },
              { icon: TrendingUp, label: "Build income",       desc: "Earn alongside your NGO contributions",     color: "bg-emerald-50 text-emerald-600" },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-3`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
                <p className="text-xs text-gray-500 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Available campaigns preview */}
        <CampaignsPreview />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Devices */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">What devices do you use? <span className="text-red-400">*</span></h2>
            <p className="text-sm text-gray-500 mb-4">Brands match you to their platform. Select all that apply.</p>
            <div className="flex flex-wrap gap-2">
              {DEVICES.map(({ id, label }) => (
                <Pill key={id} label={label} selected={devices.includes(id)} onClick={() => setDevices(toggle(devices, id))} />
              ))}
            </div>
          </div>

          {/* Follower range */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Total follower count across all platforms <span className="text-red-400">*</span>
            </h2>
            <p className="text-sm text-gray-500 mb-4">Combined across Instagram, TikTok, YouTube, X, LinkedIn, and Reddit.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FOLLOWER_RANGES.map(({ id, label, desc }) => {
                const sel = followerRange === id;
                return (
                  <button
                    type="button" key={id} onClick={() => setFollowerRange(id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${sel ? "border-violet-500 bg-violet-50" : "border-gray-100 bg-white hover:border-violet-200"}`}
                  >
                    <p className={`text-sm font-bold ${sel ? "text-violet-800" : "text-gray-800"}`}>{label}</p>
                    <p className={`text-xs mt-0.5 ${sel ? "text-violet-500" : "text-gray-400"}`}>{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Niches */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Content niches <span className="text-red-400">*</span></h2>
            <p className="text-sm text-gray-500 mb-4">What topics do you naturally post about? Select all that fit.</p>
            <div className="flex flex-wrap gap-2">
              {NICHES.map((n) => (
                <Pill key={n} label={n} selected={niches.includes(n)} onClick={() => setNiches(toggle(niches, n))} />
              ))}
            </div>
          </div>

          {/* Social handles */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <h2 className="text-base font-semibold text-gray-900">
                Social media handles <span className="text-red-400">*</span>
              </h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                filledHandles >= 3 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}>
                {filledHandles}/6 — min. 3 required
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Brands need to verify your reach. Fill in at least 3 platforms.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Instagram,  placeholder: "Instagram username",   value: instagram, setter: setInstagram, color: "text-pink-500"   },
                { icon: Zap,        placeholder: "TikTok username",      value: tiktok,    setter: setTiktok,    color: "text-gray-800"   },
                { icon: Twitter,    placeholder: "X / Twitter username", value: twitter,   setter: setTwitter,   color: "text-sky-500"    },
                { icon: Youtube,    placeholder: "YouTube handle",       value: youtube,   setter: setYoutube,   color: "text-red-500"    },
                { icon: Linkedin,   placeholder: "LinkedIn username",    value: linkedin,  setter: setLinkedin,  color: "text-blue-600"   },
                { icon: RedditIcon, placeholder: "Reddit username",      value: reddit,    setter: setReddit,    color: "text-orange-500" },
              ].map(({ icon: Icon, placeholder, value, setter, color }) => (
                <div key={placeholder} className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit — behaviour differs for PRO vs non-PRO */}
          {isPro ? (
            <>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><CheckCircle2 className="w-4 h-4" /> Register for the Beta & UGC Program</>}
              </button>
              <p className="text-center text-xs text-gray-400">
                Your profile is only shared with vetted brand partners. You can update it at any time.
              </p>
            </>
          ) : (
            <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-violet-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">Pro plan required to register</p>
                    <span className="text-[10px] font-bold bg-violet-200 text-violet-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5" /> PRO
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    Your preferences are saved. Upgrade to Pro for $25 (one-time) to activate your profile,
                    get matched with brand campaigns, and unlock unlimited NGO role applications.
                  </p>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/donor/subscription"
                      className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
                    >
                      <Crown className="w-3.5 h-3.5" /> Upgrade to Pro — $25
                    </Link>
                    <Link
                      href="/pricing"
                      className="text-xs text-violet-600 hover:text-violet-800 font-medium"
                    >
                      See what&apos;s included →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
}

// ── Root client component ──────────────────────────────────────────────────────

export default function BetaProgramClient({
  existing, isPro,
}: { existing: Profile | null; isPro: boolean }) {
  const [profile, setProfile] = useState<Profile | null>(existing);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved]     = useState(false);

  function handleSaved(p: Profile) {
    setProfile(p);
    setEditing(false);
    setSaved(true);
  }

  return (
    <div className="p-6 lg:p-10">
      {saved && !editing && (
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" />
            <p className="text-sm text-violet-800 font-medium">
              {existing ? "Preferences updated!" : "You're registered! Campaigns will appear here when launched."}
            </p>
          </div>
        </div>
      )}

      {!profile || editing
        ? <SignupForm initial={profile} isPro={isPro} onSaved={handleSaved} />
        : <StatusView profile={profile} onEdit={() => { setEditing(true); setSaved(false); }} />}
    </div>
  );
}
