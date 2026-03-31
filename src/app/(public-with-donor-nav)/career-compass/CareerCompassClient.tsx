"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MapPin, ChevronDown, ChevronRight, Bot, GraduationCap,
  TrendingUp, Briefcase, ExternalLink, Sparkles, X, Search,
  BookOpen, Clock, Zap,
} from "lucide-react";
import {
  SECTORS, US_STATES, GROWTH_COLORS, GROWTH_DOT,
  getFeaturedSectorIds, TRAINING_MODULE_META,
  type Sector, type GrowthLevel,
} from "@/lib/sector-data";

interface BfsTrend {
  totalApplications: number;
  totalFormations: number;
  latestDate: string | null;
  yoyChange: number | null;
  source: "FRED" | "static";
}

interface Props {
  bfsTrend: BfsTrend;
  isCredentialed: boolean;
  hasAccount: boolean;
}

function GrowthBadge({ level }: { level: GrowthLevel }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${GROWTH_COLORS[level]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${GROWTH_DOT[level]}`} />
      {level}
    </span>
  );
}

function SectorCard({
  sector, isFeatured, isSelected, onClick,
}: {
  sector: Sector; isFeatured: boolean; isSelected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all duration-150 hover:shadow-md ${
        isSelected
          ? "border-violet-400 bg-violet-50 shadow-md ring-2 ring-violet-200"
          : isFeatured
          ? "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{sector.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-snug">{sector.name}</p>
            {isFeatured && !isSelected && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                Popular in your state
              </span>
            )}
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform duration-150 ${isSelected ? "rotate-90 text-violet-500" : ""}`} />
      </div>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">{sector.description}</p>
      <div className="flex items-center justify-between">
        <GrowthBadge level={sector.growthLevel} />
        <span className="text-[11px] text-gray-500 font-medium">{sector.roles.length} roles</span>
      </div>
      <div className="mt-2 flex items-center gap-1 flex-wrap">
        {sector.topAiTools.slice(0, 3).map((tool) => (
          <span key={tool} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {tool}
          </span>
        ))}
      </div>
    </button>
  );
}

function RoleCard({
  role, sectorName, onExpand,
}: {
  role: Sector["roles"][0]; sectorName: string; onExpand: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) onExpand(role.trainingSlug);
  }

  return (
    <div className={`rounded-xl border transition-all duration-150 ${open ? "border-violet-200 bg-violet-50/40" : "border-gray-200 bg-white hover:border-gray-300"}`}>
      <button onClick={toggle} className="w-full text-left px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{role.title}</p>
            <p className="text-[11px] text-gray-500">{sectorName}</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-violet-100">
          <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
            <p className="text-[11px] font-semibold text-indigo-700 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Why no specialist background required
            </p>
            <p className="text-xs text-indigo-800 leading-relaxed">{role.description}</p>
          </div>

          <div className="mt-3">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">AI Tools for this role</p>
            <div className="flex flex-wrap gap-1.5">
              {role.aiTools.map((tool) => (
                <span key={tool} className="text-xs font-medium bg-gray-900 text-white px-2.5 py-1 rounded-full">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/donor/training/${role.trainingSlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors px-3 py-1.5 rounded-lg"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Prepare: {role.trainingTitle}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function TrainingPathPanel({ slugs }: { slugs: string[] }) {
  const unique = Array.from(new Set(["career-compass-prep", ...slugs]));
  const count = slugs.length;
  const isUrgent = count >= 3;

  return (
    <div className={`mt-6 rounded-2xl border p-5 transition-all duration-300 ${
      isUrgent
        ? "bg-gradient-to-r from-violet-950 to-indigo-950 border-violet-700"
        : "bg-white border-violet-200"
    }`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className={`w-4 h-4 ${isUrgent ? "text-violet-300" : "text-violet-600"}`} />
            <p className={`text-sm font-bold ${isUrgent ? "text-white" : "text-gray-900"}`}>
              Your Training Path
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isUrgent ? "bg-violet-500/30 text-violet-200" : "bg-violet-100 text-violet-700"
            }`}>
              {unique.length} module{unique.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p className={`text-xs ${isUrgent ? "text-gray-400" : "text-gray-500"}`}>
            {count < 3
              ? `Based on ${count} role${count !== 1 ? "s" : ""} explored — keep going to complete your path.`
              : `You have explored ${count} roles across multiple sectors. Start your training now.`}
          </p>
        </div>
        {isUrgent && (
          <div className="shrink-0 flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full">
            <Zap className="w-3 h-3" /> Ready
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {unique.map((slug) => {
          const meta = TRAINING_MODULE_META[slug];
          if (!meta) return null;
          const isCompassPrep = slug === "career-compass-prep";
          return (
            <Link
              key={slug}
              href={`/donor/training/${slug}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                isUrgent
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-violet-50 hover:bg-violet-100 border border-violet-100"
              }`}
            >
              <span className="text-base shrink-0">{meta.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-xs font-semibold truncate ${isUrgent ? "text-white" : "text-gray-900"}`}>
                    {meta.title}
                  </p>
                  {isCompassPrep && (
                    <span className={`text-[9px] font-bold px-1.5 py-px rounded-full shrink-0 ${
                      isUrgent ? "bg-amber-400 text-amber-900" : "bg-violet-600 text-white"
                    }`}>
                      START HERE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="w-2.5 h-2.5 text-gray-400" />
                  <span className={`text-[10px] ${isUrgent ? "text-gray-400" : "text-gray-500"}`}>{meta.duration}</span>
                  <span className={`text-[10px] ${isUrgent ? "text-gray-500" : "text-gray-300"}`}>·</span>
                  <span className={`text-[10px] ${isUrgent ? "text-gray-400" : "text-gray-500"}`}>Module {meta.number}</span>
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                isUrgent ? "text-gray-400 group-hover:text-white" : "text-gray-300 group-hover:text-violet-600"
              }`} />
            </Link>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Link
          href="/donor/training/career-compass-prep"
          className={`flex-1 text-center text-xs font-bold py-2.5 rounded-xl transition-colors ${
            isUrgent
              ? "bg-amber-400 text-amber-900 hover:bg-amber-300"
              : "bg-violet-600 text-white hover:bg-violet-700"
          }`}
        >
          Start training →
        </Link>
        <Link
          href="/donor/training"
          className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors ${
            isUrgent
              ? "bg-white/10 text-gray-300 hover:bg-white/20"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All modules
        </Link>
      </div>
    </div>
  );
}

export default function CareerCompassClient({ bfsTrend, isCredentialed, hasAccount }: Props) {
  const [selectedState, setSelectedState] = useState("");
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [exploredSlugs, setExploredSlugs] = useState<string[]>([]);
  const detailRef = useRef<HTMLDivElement>(null);
  const trainingPanelRef = useRef<HTMLDivElement>(null);

  const featuredIds = getFeaturedSectorIds(selectedState);

  const filteredSectors = searchQuery.trim()
    ? SECTORS.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.roles.some((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : SECTORS;

  const selectedSector = SECTORS.find((s) => s.id === selectedSectorId) ?? null;

  function handleSelectSector(id: string) {
    setSelectedSectorId((prev) => (prev === id ? null : id));
  }

  function handleRoleExpand(slug: string) {
    setExploredSlugs((prev) => {
      if (prev.includes(slug)) return prev;
      const next = [...prev, slug];
      if (next.length === 3) {
        setTimeout(() => {
          trainingPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 300);
      }
      return next;
    });
  }

  useEffect(() => {
    if (selectedSectorId && detailRef.current) {
      const rect = detailRef.current.getBoundingClientRect();
      if (rect.top < 0 || rect.top > window.innerHeight) {
        detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [selectedSectorId]);

  const stateName = US_STATES.find((s) => s.code === selectedState)?.name ?? null;
  const showTrainingPanel = exploredSlugs.length > 0;

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      {/* ── HEADER ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-950 via-violet-950 to-indigo-950 px-6 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-1 rounded-full">
              Phase 1 · Sector Intelligence
            </span>
            {bfsTrend.source === "FRED" && (
              <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                Live FRED data
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">Career Compass</h1>
          <p className="text-base text-gray-300 max-w-2xl leading-relaxed mb-8">
            Your GiveLedger credential — earned through verified NGO work — is now recognised by for-profit companies.
            Explore 12 sectors, 60+ AI-augmented roles, and the exact tools that make specialist experience optional.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Sectors tracked", value: "12" },
              { label: "AI-augmented roles", value: "60+" },
              { label: "New US businesses/mo", value: bfsTrend.totalApplications ? `${(bfsTrend.totalApplications / 1000).toFixed(0)}k` : "470k" },
              { label: "Sector growth YoY", value: bfsTrend.yoyChange ? `+${bfsTrend.yoyChange}%` : "+4%" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                <p className="text-xl font-black text-white">{value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILTER / SEARCH BAR ───────────────────────────────── */}
      <div className="sticky top-[52px] z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-[200px]">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="bg-transparent text-sm text-gray-700 outline-none w-full">
              <option value="">All states</option>
              {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search sectors or roles…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {!hasAccount ? (
            <Link href="/signup" className="text-xs font-semibold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap">
              Earn your credential →
            </Link>
          ) : !isCredentialed ? (
            <Link href="/opportunities" className="text-xs font-semibold bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors whitespace-nowrap">
              Start earning credential →
            </Link>
          ) : (
            <Link href="/donor/credential" className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5" /> View my credential
            </Link>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* State context banner */}
        {stateName && (
          <div className="mb-6 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Fastest-growing sectors for AI-augmented talent in {stateName}</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Based on US Census Bureau Business Formation Statistics — {US_STATES.find((s) => s.code === selectedState)?.name} new business formations. Sectors marked "Popular in your state" have the highest relative growth.
              </p>
            </div>
          </div>
        )}

        {/* Training nudge — before any roles explored */}
        {!showTrainingPanel && (
          <div className="mb-6 flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
            <BookOpen className="w-4 h-4 text-violet-500 shrink-0" />
            <p className="text-xs text-violet-800 flex-1">
              <span className="font-semibold">Tip:</span> Expand any role card to see which AI tools you need — your personalised training path builds automatically as you explore.
            </p>
            <Link href="/donor/training/career-compass-prep" className="text-xs font-semibold text-violet-700 hover:underline shrink-0 whitespace-nowrap">
              Role prep module →
            </Link>
          </div>
        )}

        {/* Growth legend */}
        <div className="mb-5 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium mr-1">Growth signal:</span>
          {(["Very High", "High", "Growing", "Steady"] as GrowthLevel[]).map((level) => (
            <span key={level} className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${GROWTH_COLORS[level]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${GROWTH_DOT[level]}`} />
              {level}
            </span>
          ))}
          <span className="text-[10px] text-gray-400 ml-1">— Source: US Census Bureau BFS</span>
        </div>

        {filteredSectors.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No sectors match your search.</p>
            <button onClick={() => setSearchQuery("")} className="text-xs text-violet-600 hover:underline mt-1">Clear search</button>
          </div>
        )}

        {/* Sector grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {filteredSectors.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              isFeatured={!!selectedState && featuredIds.includes(sector.id)}
              isSelected={selectedSectorId === sector.id}
              onClick={() => handleSelectSector(sector.id)}
            />
          ))}
        </div>

        {/* ── SECTOR DETAIL PANEL ───────────────────────────── */}
        {selectedSector && (
          <div ref={detailRef} className="mt-2 rounded-2xl border border-violet-200 bg-white shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-violet-950 to-indigo-950 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{selectedSector.emoji}</span>
                    <h2 className="text-lg font-black text-white">{selectedSector.name}</h2>
                  </div>
                  <p className="text-sm text-gray-300 max-w-xl leading-relaxed">{selectedSector.description}</p>
                </div>
                <button onClick={() => setSelectedSectorId(null)} className="text-gray-400 hover:text-white mt-1 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <GrowthBadge level={selectedSector.growthLevel} />
                <span className="text-sm font-bold text-white">{selectedSector.growthPct}</span>
                <span className="text-[11px] text-gray-400">{selectedSector.jobsLabel}</span>
                <span className="text-[11px] text-gray-400">NAICS {selectedSector.naics}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex items-start gap-3">
              <Bot className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-indigo-900">All roles below are AI-Augmented — no prior domain specialism required</p>
                <p className="text-xs text-indigo-700 mt-0.5">
                  AI fluency is the entry qualification. Each role description explains exactly how AI removes the traditional experience barrier.
                  Your GiveLedger credential demonstrates you can apply these tools to real-world tasks.
                </p>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-900">{selectedSector.roles.length} AI-Augmented Roles in {selectedSector.name}</h3>
                <span className="text-xs text-gray-400">— click to expand each role</span>
              </div>
              <div className="space-y-2">
                {selectedSector.roles.map((role) => (
                  <RoleCard key={role.title} role={role} sectorName={selectedSector.name} onExpand={handleRoleExpand} />
                ))}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-5 border-t border-gray-100">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-900 mb-0.5">Ready to prepare?</p>
                  <p className="text-[11px] text-gray-500">
                    Expand roles above to build your training path, then start the module that fits your target role.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href="/opportunities" className="text-xs font-semibold bg-emerald-700 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-800 transition-colors">
                    Find NGO roles →
                  </Link>
                  <Link href="/donor/training/career-compass-prep" className="text-xs font-semibold border border-violet-200 text-violet-700 bg-violet-50 px-4 py-2.5 rounded-lg hover:bg-violet-100 transition-colors">
                    Role prep training →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TRAINING PATH PANEL — appears after first role expansion ── */}
        {showTrainingPanel && (
          <div ref={trainingPanelRef}>
            <TrainingPathPanel slugs={exploredSlugs} />
          </div>
        )}

        {/* ── BOTTOM EXPLAINER ─────────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "01", icon: <Briefcase className="w-5 h-5 text-emerald-600" />, title: "Work with an NGO", body: "Apply for a volunteer or paid role at a verified GiveLedger NGO. Your hours, skills, and outcomes are recorded on-chain." },
            { step: "02", icon: <Sparkles className="w-5 h-5 text-violet-600" />, title: "Earn your credential", body: "When the NGO confirms your contribution, you receive a blockchain-verified GiveLedger credential — a real work record, not a self-reported claim." },
            { step: "03", icon: <TrendingUp className="w-5 h-5 text-blue-600" />, title: "Apply to companies", body: "Your credential is recognised by for-profit companies hiring AI-augmented generalists. Phase 3 will list company profiles here for proactive applications." },
          ].map(({ step, icon, title, body }) => (
            <div key={step} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-black text-gray-300">{step}</span>
                {icon}
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-gray-400">
          Growth signals sourced from{" "}
          <a href="https://www.census.gov/econ/bfs/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
            US Census Bureau Business Formation Statistics
          </a>{" "}
          via{" "}
          <a href="https://fred.stlouisfed.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
            FRED
          </a>
          {bfsTrend.source === "FRED" && " · Live data"}.
          Role guidance is AI-curated and should be used as preparation intelligence, not as a guaranteed hiring signal.
        </p>
      </div>
    </div>
  );
}
