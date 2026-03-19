"use client";
import { useState } from "react";
import {
  Smartphone, Video, CheckCircle2, Loader2, AlertCircle, Pencil,
  Instagram, Twitter, Youtube, Zap, BadgeCheck, Users, TrendingUp,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Profile = {
  id: string;
  interests: string[];
  devices: string[];
  followerRange: string;
  niches: string[];
  instagramHandle: string | null;
  tiktokHandle:    string | null;
  twitterHandle:   string | null;
  youtubeHandle:   string | null;
  isActive: boolean;
  registeredAt: Date;
};

// ── Option data ────────────────────────────────────────────────────────────────

const INTERESTS = [
  { id: "BETA_TESTING", label: "Beta Testing",      desc: "Test apps before public launch and give feedback", icon: Smartphone },
  { id: "UGC_CONTENT",  label: "UGC Creator",       desc: "Create content about products for social media",   icon: Video      },
];

const DEVICES = [
  { id: "iOS",              label: "iPhone / iPad" },
  { id: "Android",          label: "Android"       },
  { id: "Desktop_Mac",      label: "Mac"           },
  { id: "Desktop_Windows",  label: "Windows PC"    },
];

const FOLLOWER_RANGES = [
  { id: "UNDER_1K",   label: "Under 1K",    desc: "Micro" },
  { id: "1K_10K",     label: "1K – 10K",    desc: "Nano"  },
  { id: "10K_50K",    label: "10K – 50K",   desc: "Micro" },
  { id: "50K_PLUS",   label: "50K+",        desc: "Macro" },
];

const NICHES = [
  "Tech & Apps", "Lifestyle", "Finance & Business", "Health & Wellness",
  "Gaming", "Food & Beverage", "Travel", "Fashion & Beauty",
];

const INTEREST_LABELS: Record<string, string> = {
  BETA_TESTING: "Beta Testing", UGC_CONTENT: "UGC Creator",
};
const DEVICE_LABELS: Record<string, string> = {
  iOS: "iPhone / iPad", Android: "Android", Desktop_Mac: "Mac", Desktop_Windows: "Windows PC",
};
const FOLLOWER_LABELS: Record<string, string> = {
  UNDER_1K: "Under 1K", "1K_10K": "1K – 10K", "10K_50K": "10K – 50K", "50K_PLUS": "50K+",
};

// ── Multi-select pill ──────────────────────────────────────────────────────────

function Pill({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
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

// ── Registered status view ─────────────────────────────────────────────────────

function StatusView({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  const registeredDate = new Date(profile.registeredAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-gray-900">Beta & UGC Program</h1>
          <p className="text-gray-500 text-sm mt-1">Member since {registeredDate}</p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit preferences
        </button>
      </div>

      {/* Status card */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-violet-600" />
          <p className="font-semibold text-gray-900">You are registered and visible to brands</p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          When campaigns are launched on our partner platform, you will be matched with brands based on
          your interests, devices, content niches, and reach. You will receive campaign invitations directly.
        </p>
      </div>

      {/* Profile details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Interested in</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((i) => (
              <span key={i} className="text-sm bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-medium">
                {INTEREST_LABELS[i] ?? i}
              </span>
            ))}
          </div>
        </div>

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

        {(profile.instagramHandle || profile.tiktokHandle || profile.twitterHandle || profile.youtubeHandle) && (
          <div className="sm:col-span-2 bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Social handles</p>
            <div className="flex flex-wrap gap-4">
              {profile.instagramHandle && (
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  @{profile.instagramHandle}
                </div>
              )}
              {profile.tiktokHandle && (
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Zap className="w-4 h-4 text-gray-900" />
                  @{profile.tiktokHandle}
                </div>
              )}
              {profile.twitterHandle && (
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Twitter className="w-4 h-4 text-sky-500" />
                  @{profile.twitterHandle}
                </div>
              )}
              {profile.youtubeHandle && (
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Youtube className="w-4 h-4 text-red-500" />
                  @{profile.youtubeHandle}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">
        Campaigns will come from our partner platform. Your GiveLedger profile will be used for matching.
      </p>
    </div>
  );
}

// ── Sign-up form ───────────────────────────────────────────────────────────────

function SignupForm({
  initial, onSaved,
}: { initial: Profile | null; onSaved: (p: Profile) => void }) {
  const [interests, setInterests]         = useState<string[]>(initial?.interests    ?? []);
  const [devices, setDevices]             = useState<string[]>(initial?.devices      ?? []);
  const [followerRange, setFollowerRange] = useState(initial?.followerRange ?? "");
  const [niches, setNiches]               = useState<string[]>(initial?.niches       ?? []);
  const [instagram, setInstagram]         = useState(initial?.instagramHandle ?? "");
  const [tiktok, setTiktok]               = useState(initial?.tiktokHandle    ?? "");
  const [twitter, setTwitter]             = useState(initial?.twitterHandle   ?? "");
  const [youtube, setYoutube]             = useState(initial?.youtubeHandle   ?? "");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!interests.length) { setError("Please select at least one interest."); return; }
    if (!devices.length)   { setError("Please select at least one device."); return; }
    if (!followerRange)    { setError("Please select your follower range."); return; }
    if (!niches.length)    { setError("Please select at least one content niche."); return; }

    setLoading(true);
    const res = await fetch("/api/donor/beta-program", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interests, devices, followerRange, niches,
        instagramHandle: instagram.replace(/^@/, ""),
        tiktokHandle:    tiktok.replace(/^@/, ""),
        twitterHandle:   twitter.replace(/^@/, ""),
        youtubeHandle:   youtube.replace(/^@/, ""),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); return; }
    onSaved(data.profile);
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <Zap className="w-3.5 h-3.5" /> Earn while you help
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Beta Tester & UGC Creator Program</h1>
        <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
          Get paid by brands to test their apps before launch and post honest content to your social channels.
          This connects directly to our campaign platform where brands send you opportunities.
        </p>

        {/* 3 value props */}
        <div className="grid grid-cols-3 gap-4 mt-8 text-left">
          {[
            { icon: Smartphone, label: "Test apps first",    desc: "Access products before public launch",         color: "bg-violet-50 text-violet-600" },
            { icon: Video,      label: "Create UGC content", desc: "Post authentic reviews and earn per campaign", color: "bg-pink-50 text-pink-600"   },
            { icon: TrendingUp, label: "Build income",       desc: "Earn alongside your NGO contributions",        color: "bg-emerald-50 text-emerald-600" },
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* 1 — What are you interested in? */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">What are you interested in? <span className="text-red-400">*</span></h2>
          <p className="text-sm text-gray-500 mb-4">You can select both.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {INTERESTS.map(({ id, label, desc, icon: Icon }) => {
              const sel = interests.includes(id);
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => setInterests(toggle(interests, id))}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    sel ? "border-violet-500 bg-violet-50" : "border-gray-100 bg-white hover:border-violet-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${sel ? "bg-violet-100" : "bg-gray-100"}`}>
                      <Icon className={`w-4 h-4 ${sel ? "text-violet-600" : "text-gray-500"}`} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${sel ? "text-violet-900" : "text-gray-800"}`}>{label}</p>
                      <p className={`text-xs mt-0.5 leading-snug ${sel ? "text-violet-600" : "text-gray-500"}`}>{desc}</p>
                    </div>
                    {sel && <CheckCircle2 className="w-4 h-4 text-violet-500 ml-auto shrink-0 mt-0.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 — Devices */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">What devices do you use? <span className="text-red-400">*</span></h2>
          <p className="text-sm text-gray-500 mb-4">Brands match you to their app's platform. Select all that apply.</p>
          <div className="flex flex-wrap gap-2">
            {DEVICES.map(({ id, label }) => (
              <Pill
                key={id}
                label={label}
                selected={devices.includes(id)}
                onClick={() => setDevices(toggle(devices, id))}
              />
            ))}
          </div>
        </div>

        {/* 3 — Follower range */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            What is your total follower count across all platforms? <span className="text-red-400">*</span>
          </h2>
          <p className="text-sm text-gray-500 mb-4">Combined across Instagram, TikTok, YouTube, and X.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FOLLOWER_RANGES.map(({ id, label, desc }) => {
              const sel = followerRange === id;
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => setFollowerRange(id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    sel ? "border-violet-500 bg-violet-50" : "border-gray-100 bg-white hover:border-violet-200"
                  }`}
                >
                  <p className={`text-sm font-bold ${sel ? "text-violet-800" : "text-gray-800"}`}>{label}</p>
                  <p className={`text-xs mt-0.5 ${sel ? "text-violet-500" : "text-gray-400"}`}>{desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 — Niches */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Content niches <span className="text-red-400">*</span></h2>
          <p className="text-sm text-gray-500 mb-4">What topics do you naturally post about? Select all that fit.</p>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <Pill
                key={n}
                label={n}
                selected={niches.includes(n)}
                onClick={() => setNiches(toggle(niches, n))}
              />
            ))}
          </div>
        </div>

        {/* 5 — Social handles */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Social media handles</h2>
          <p className="text-sm text-gray-500 mb-4">Optional — add at least one so brands can find you.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: Instagram, placeholder: "Instagram username",  value: instagram, setter: setInstagram, color: "text-pink-500" },
              { icon: Zap,       placeholder: "TikTok username",     value: tiktok,    setter: setTiktok,    color: "text-gray-800" },
              { icon: Twitter,   placeholder: "X / Twitter username", value: twitter,   setter: setTwitter,   color: "text-sky-500"  },
              { icon: Youtube,   placeholder: "YouTube handle",      value: youtube,   setter: setYoutube,   color: "text-red-500"  },
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
          Your profile is only shared with vetted brand partners on our campaign platform.
          You can update or remove it at any time.
        </p>
      </form>
    </div>
  );
}

// ── Root client component ──────────────────────────────────────────────────────

export default function BetaProgramClient({ existing }: { existing: Profile | null }) {
  const [profile, setProfile]   = useState<Profile | null>(existing);
  const [editing, setEditing]   = useState(false);
  const [saved, setSaved]       = useState(false);

  function handleSaved(p: Profile) {
    setProfile(p);
    setEditing(false);
    setSaved(true);
  }

  const showForm = !profile || editing;

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

      {showForm
        ? <SignupForm initial={profile} onSaved={handleSaved} />
        : <StatusView profile={profile!} onEdit={() => { setEditing(true); setSaved(false); }} />}
    </div>
  );
}
