"use client";

import { useState } from "react";
import { UpdateCard } from "@/components/public/cards";
import type { Update, Doctor } from "@/types/database";
import { useIsMobile } from "@/lib/use-mobile";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

export function UpdatesBrowser({
  updates,
  doctors,
  categories,
}: {
  updates: Update[];
  doctors: Doctor[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("All");
  const [page, setPage] = useState(1);
  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? 4 : 9;

  const handleCategoryClick = (cat: string) => {
    setActive(cat);
    setPage(1);
  };

  const filtered = updates.filter((u) => {
    return active === "All" || u.category === active;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const paginationRange = generatePagination(page, totalPages);

  return (
    <div>
      <div className="mt-8 flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-slate-500 mr-2">Filter:</span>
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active === cat
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.map((u) => (
          <UpdateCard key={u.id} update={u} author={doctors.find(d => d.id === u.author_id)} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-slate-500">No updates found for this category.</p>
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
                    if (page > 1) {
                      setPage(p => p - 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
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
                        window.scrollTo({ top: 0, behavior: "smooth" });
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
                    if (page < totalPages) {
                      setPage(p => p + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
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
