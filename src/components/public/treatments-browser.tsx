"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/public/cards";
import type { Service } from "@/types/database";
import { GooeyInput } from "@/components/ui/gooey-input";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Helper for complex pagination logic
function generatePagination(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

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

  const paginationRange = generatePagination(page, totalPages);

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
        <div className="mt-12 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(p => p - 1);
                  }}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {paginationRange.map((p, i) => (
                <PaginationItem key={i}>
                  {p === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p as number);
                      }}
                      isActive={page === p}
                    >
                      {p}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(p => p + 1);
                  }}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
