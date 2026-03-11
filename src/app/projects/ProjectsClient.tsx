"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Search, SlidersHorizontal } from "lucide-react";

const categories = [
  { id: "ALL", label: "All Projects" },
  { id: "INCOME_GENERATION", label: "Income Generation" },
  { id: "CHILD_CARE", label: "Child Care" },
  { id: "ELDERLY_CARE", label: "Elderly Care" },
  { id: "PHYSICALLY_DISABLED", label: "Accessibility" },
  { id: "PET_CARE", label: "Animal Welfare" },
];

const allProjects = [
  { id: "1", title: "Clean Water for Kibera Schools", ngo: "WaterBridge Kenya", category: "CHILD_CARE", desc: "Installing water filtration systems in 12 schools across Kibera, providing safe drinking water to 6,000+ students.", raised: 18400, goal: 25000, image: "💧", backers: 142, daysLeft: 22 },
  { id: "2", title: "Livelihood Training - Rural Bihar", ngo: "Pragati Foundation", category: "INCOME_GENERATION", desc: "Vocational training in tailoring, electronics repair, and mobile servicing for 200 rural women in Bihar.", raised: 31200, goal: 40000, image: "🧵", backers: 89, daysLeft: 35 },
  { id: "3", title: "Elderly Care Home - Mysore", ngo: "SilverYears Trust", category: "ELDERLY_CARE", desc: "Building a dignified care facility for 50 elderly residents with medical support and recreational activities.", raised: 62000, goal: 80000, image: "🏠", backers: 317, daysLeft: 14 },
  { id: "4", title: "Wheelchair Access - Mumbai Slums", ngo: "AccessAbility India", category: "PHYSICALLY_DISABLED", desc: "Installing ramps and accessible pathways in 8 community buildings to enable mobility for 120 wheelchair users.", raised: 8900, goal: 15000, image: "♿", backers: 67, daysLeft: 45 },
  { id: "5", title: "Animal Rescue & Rehabilitation", ngo: "PawsNairobi", category: "PET_CARE", desc: "Building a veterinary care facility for abandoned animals and training 50 community volunteers in animal welfare.", raised: 5200, goal: 12000, image: "🐾", backers: 44, daysLeft: 60 },
  { id: "6", title: "Solar Microgrids for Rural Schools", ngo: "SunPower Africa", category: "INCOME_GENERATION", desc: "Installing solar energy systems in 6 off-grid schools, enabling evening study and reducing generator fuel costs.", raised: 42000, goal: 55000, image: "☀️", backers: 201, daysLeft: 28 },
];

const categoryLabel: Record<string, string> = {
  INCOME_GENERATION: "Income Generation",
  CHILD_CARE: "Child Care",
  ELDERLY_CARE: "Elderly Care",
  PHYSICALLY_DISABLED: "Accessibility",
  PET_CARE: "Animal Welfare",
};

type SortOption = "newest" | "most-funded" | "ending-soon";

export default function ProjectsClient() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("most-funded");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = allProjects;
    if (activeCategory !== "ALL") list = list.filter((p) => p.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.ngo.toLowerCase().includes(q));
    }
    if (sort === "most-funded") list = [...list].sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
    if (sort === "ending-soon") list = [...list].sort((a, b) => a.daysLeft - b.daysLeft);
    return list;
  }, [activeCategory, query, sort]);

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
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setSortOpen(!sortOpen)}>
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
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
                }`}
              >
                {cat.label}
              </button>
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
            <button onClick={() => { setQuery(""); setActiveCategory("ALL"); }} className="mt-3 text-emerald-600 text-sm hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => {
              const pct = Math.round((project.raised / project.goal) * 100);
              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow group">
                  <div className="h-44 bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center rounded-t-xl text-5xl group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    {project.image}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-0.5 text-xs font-semibold">
                        {categoryLabel[project.category]}
                      </span>
                      <span className="text-xs text-gray-400">{project.daysLeft} days left</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm leading-snug">{project.title}</h3>
                    <p className="text-xs text-emerald-700 font-medium mb-3">{project.ngo}</p>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.desc}</p>
                    <Progress value={pct} className="mb-2" />
                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span className="font-semibold text-gray-900">${project.raised.toLocaleString()} raised</span>
                      <span>{pct}% funded</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{project.backers} backers</span>
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
