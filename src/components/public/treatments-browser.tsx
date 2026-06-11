"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/public/cards";
import type { Service } from "@/types/database";
import { GooeyInput } from "@/components/ui/gooey-input";

export function TreatmentsBrowser({
  services,
  categories,
}: {
  services: Service[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = services.filter((s) => {
    const matchesCategory = active === "All" || s.category === active;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (s.title || "").toLowerCase().includes(searchLower) ||
      (s.short_description || "").toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === cat
                ? "bg-brand-600 text-white"
                : "border border-slate-300 text-slate-600 hover:border-brand-400"
            }`}
          >
            {cat}
          </button>
        ))}
        </div>
        <div className="flex justify-end pr-[50px] sm:pr-0">
          <GooeyInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search treatments..."
            collapsedWidth={120}
            expandedWidth={260}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-slate-500">No treatments found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}
