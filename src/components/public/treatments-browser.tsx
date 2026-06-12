"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/public/cards";
import type { Service } from "@/types/database";
import { GooeyInput } from "@/components/ui/gooey-input";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

export function TreatmentsBrowser({
  services,
  categories,
}: {
  services: Service[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  const handleCategoryClick = (cat: string) => {
    setActive(cat);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const filtered = services.filter((s) => {
    const matchesCategory = active === "All" || s.category === active;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (s.title || "").toLowerCase().includes(searchLower) ||
      (s.short_description || "").toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryClick(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active === cat
                ? "bg-brand-600 text-white"
                : "border border-slate-300 text-slate-600 hover:border-brand-400"
            }`}
          >
            {cat.replace(/#/g, "").trim()}
          </button>
        ))}
        </div>
        <div className="flex justify-end pr-[50px] sm:pr-0">
          <GooeyInput
            value={searchQuery}
            onValueChange={handleSearchChange}
            placeholder="Search treatments..."
            collapsedWidth={120}
            expandedWidth={260}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-slate-500">No treatments found matching your criteria.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-brand-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500"
          >
            <IconChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  page === p
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-brand-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500"
          >
            <IconChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
