"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Search, SlidersHorizontal } from "lucide-react";

export type ProjectSummary = {
  id: string;
  title: string;
  ngoId: string;
  ngoName: string;
  category: string;
  description: string;
  raisedAmount: number;
  goalAmount: number;
  donorCount: number;
  daysLeft: number;
};

const categories = [
  { id: "ALL", label: "All Projects" },
  { id: "INCOME_GENERATION", label: "Income Generation" },
  { id: "CHILD_CARE", label: "Child Care" },
  { id: "ELDERLY_CARE", label: "Elderly Care" },
  { id: "PHYSICALLY_DISABLED", label: "Accessibility" },
  { id: "PET_CARE", label: "Animal Welfare" },
  { id: "OTHER", label: "Other" },
];

const categoryLabel: Record<string, string> = {
  INCOME_GENERATION: "Income Generation",
  CHILD_CARE: "Child Care",
  ELDERLY_CARE: "Elderly Care",
  PHYSICALLY_DISABLED: "Accessibility",
  PET_CARE: "Animal Welfare",
  OTHER: "Other",
};

const categoryEmoji: Record<string, string> = {
  INCOME_GENERATION: "🧵",
  CHILD_CARE: "💧",
  ELDERLY_CARE: "🏠",
  PHYSICALLY_DISABLED: "♿",
  PET_CARE: "🐾",
  OTHER: "🌱",
};

type SortOption = "newest" | "most-funded" | "ending-soon";

export default function ProjectsClient({ projects, initialCategory = "ALL" }: { projects: ProjectSummary[]; initialCategory?: string }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("most-funded");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = projects;
    if (activeCategory !== "ALL") list = list.filter((p) => p.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.ngoName.toLowerCase().includes(q)
      );
    }
    if (sort === "most-funded")
      list = [...list].sort((a, b) => b.raisedAmount / b.goalAmount - a.raisedAmount / a.goalAmount);
    if (sort === "ending-soon")
      list = [...list].sort((a, b) => a.daysLeft - b.daysLeft);
    if (sort === "newest")
      list = [...list]; // already ordered by createdAt desc from server
    return list;
  }, [projects, activeCategory, query, sort]);

  return (
    <>
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Projects</h1>
          <p className="text-gray-500 text-sm">All projects are verified and milestone-tracked on-chain.</p>

          <div className="flex gap-3 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects or NGOs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
            <div className="relative">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setSortOpen(!sortOpen)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {sort === "most-funded" ? "Most Funded" : sort === "ending-soon" ? "Ending Soon" : "Newest"}
              </Button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-40">
                  {(["most-funded", "ending-soon", "newest"] as SortOption[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSort(opt); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${sort === opt ? "text-emerald-700 font-medium" : "text-gray-700"}`}
                    >
                      {opt === "most-funded" ? "Most Funded" : opt === "ending-soon" ? "Ending Soon" : "Newest"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.id === "ALL" ? "/projects" : `/projects?category=${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-500 mb-6">
          {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
          {query && ` for "${query}"`}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No projects match your search.</p>
            <button
              onClick={() => { setQuery(""); setActiveCategory("ALL"); }}
              className="mt-3 text-emerald-600 text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => {
              const pct = project.goalAmount > 0
                ? Math.round((project.raisedAmount / project.goalAmount) * 100)
                : 0;
              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow group">
                  <div className="h-44 bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center rounded-t-xl text-5xl group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    {categoryEmoji[project.category] ?? "🌱"}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        href={`/projects?category=${project.category}`}
                        onClick={() => setActiveCategory(project.category)}
                        className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5 text-xs font-semibold hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                      >
                        {categoryLabel[project.category] ?? project.category}
                      </Link>
                      <span className="text-xs text-gray-400">
                        {project.daysLeft > 0 ? `${project.daysLeft} days left` : "Ending soon"}
                      </span>
                    </div>
                    <Link href={`/projects/${project.id}`} className="font-semibold text-gray-900 mb-1 text-sm leading-snug hover:underline block">
                      {project.title}
                    </Link>
                    <Link href={`/ngo/${project.ngoId}`} className="text-xs text-emerald-700 font-medium mb-3 hover:underline block">
                      {project.ngoName}
                    </Link>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                    <Progress value={pct} className="mb-2" />
                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span className="font-semibold text-gray-900">
                        ${project.raisedAmount.toLocaleString()} raised
                      </span>
                      <span>{pct}% funded</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{project.donorCount} backers</span>
                      <div className="flex gap-2">
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">Details</Button>
                        </Link>
                        <Link href={`/projects/${project.id}?action=donate`}>
                          <Button size="sm" className="text-xs">Donate</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
