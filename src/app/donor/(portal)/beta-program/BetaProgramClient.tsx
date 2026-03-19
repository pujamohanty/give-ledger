"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Smartphone, Video, CheckCircle2, Loader2, AlertCircle, Pencil,
  Instagram, Twitter, Youtube, Zap, BadgeCheck, TrendingUp,
  Linkedin, Crown, ArrowRight, Lock,
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

// ── Reddit SVG icon (not in lucide) ───────────────────────────────────────────

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

// ── PRO upgrade gate ───────────────────────────────────────────────────────────

function ProGate() {
  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-6">
        <Lock className="w-7 h-7 text-violet-500" />
      </div>
      <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
        <Crown className="w-3.5 h-3.5" /> PRO plan required
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Beta Tester & UGC Creator Program</h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
        This program is exclusive to Pro plan members. Upgrade once for $25 to unlock unlimited
        role applications, priority NGO visibility, and access to paid brand campaigns.
      </p>

      <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 text-left mb-8">
        <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-4">What you unlock with Pro</p>
        <ul className="space-y-3">
          {[
            "Unlimited role applications to NGOs",
            "Priority listing in NGO applicant view",
            "PRO badge visible to hiring NGOs",
            "Access to Beta Tester & UGC Creator Program",
            "100% refund after 18 months",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/donor/subscription"
        className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
      >
        <Crown className="w-4 h-4" /> Upgrade to Pro — $25 <ArrowRight className="w-4 h-4" />
      </Link>
      <p className="text-xs text-gray-400 mt-4">One-time payment · 100% refund guarantee after 18 months</p>
    </div>
  );
}

// ── Registered status view ─────────────────────────────────────────────────────

function StatusView({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  const registeredDate = new Date(profile.registeredAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const socialHandles = [
    { icon: Instagram,  value: profile.instagramHandle, color: "text-pink-500",    label: "Instagram" },
    { icon: Zap,        value: profile.tiktokHandle,    color: "text-gray-800",    label: "TikTok"    },
    { icon: Twitter,    value: profile.twitterHandle,   color: "text-sky-500",     label: "X"         },
    { icon: Youtube,    value: profile.youtubeHandle,   color: "text-red-500",     label: "YouTube"   },
    { icon: Linkedin,   value: profile.linkedinHandle,  color: "text-blue-600",    label: "LinkedIn"  },
    { icon: RedditIcon, value: profile.redditHandle,    color: "text-orange-500",  label: "Reddit"    },
  ].filter((s) => s.value);

  return (
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
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit preferences
        </button>
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
                <span className="text-gray-500 text-xs w-16 shrink-0">{label}</span>
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
  );
}

// ── Sign-up form ───────────────────────────────────────────────────────────────

function SignupForm({ initial, onSaved }: { initial: Profile | null; onSaved: (p: Profile) => void }) {
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

  // Count how many handles are filled
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
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <Zap className="w-3.5 h-3.5" /> PRO benefit — earn while you help
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Beta Tester & UGC Creator Program</h1>
        <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
          Get paid by brands to test their apps before launch and post authentic content across your
          social channels. Campaigns come directly to your dashboard from our partner platform.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-8 text-left">
          {[
            { icon: Smartphone, label: "Test apps first",    desc: "Early access to products before public launch", color: "bg-violet-50 text-violet-600"  },
            { icon: Video,      label: "Create UGC content", desc: "Post authentic reviews, earn per campaign",     color: "bg-pink-50 text-pink-600"      },
            { icon: TrendingUp, label: "Build income",       desc: "Earn alongside your NGO contributions",         color: "bg-emerald-50 text-emerald-600" },
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

        {/* Social handles — required, at least 3 */}
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
              { icon: Instagram,  placeholder: "Instagram username",  value: instagram, setter: setInstagram, color: "text-pink-500"   },
              { icon: Zap,        placeholder: "TikTok username",     value: tiktok,    setter: setTiktok,    color: "text-gray-800"   },
              { icon: Twitter,    placeholder: "X / Twitter username", value: twitter,  setter: setTwitter,   color: "text-sky-500"    },
              { icon: Youtube,    placeholder: "YouTube handle",      value: youtube,   setter: setYoutube,   color: "text-red-500"    },
              { icon: Linkedin,   placeholder: "LinkedIn username",   value: linkedin,  setter: setLinkedin,  color: "text-blue-600"   },
              { icon: RedditIcon, placeholder: "Reddit username",     value: reddit,    setter: setReddit,    color: "text-orange-500" },
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

export default function BetaProgramClient({
  existing, isPro,
}: { existing: Profile | null; isPro: boolean }) {
  const [profile, setProfile] = useState<Profile | null>(existing);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved]     = useState(false);

  if (!isPro) return <div className="p-6 lg:p-10"><ProGate /></div>;

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
        ? <SignupForm initial={profile} onSaved={handleSaved} />
        : <StatusView profile={profile} onEdit={() => { setEditing(true); setSaved(false); }} />}
    </div>
  );
}
