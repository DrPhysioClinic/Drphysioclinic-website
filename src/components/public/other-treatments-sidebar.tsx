"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type TreatmentMinimal = {
  id: string;
  title: string;
  slug: string;
};

export function OtherTreatmentsSidebar({ treatments }: { treatments: TreatmentMinimal[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  const totalPages = Math.ceil(treatments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleTreatments = treatments.slice(startIndex, startIndex + itemsPerPage);

  if (treatments.length === 0) return null;

  return (
    <div className="mt-8 pt-4">
      <h3 className="text-xl font-bold text-[#17153f] mb-2">Other Treatments</h3>
      <div className="h-0.5 w-16 bg-brand-300 mb-5"></div>
      
      <div className="rounded-lg border border-[#17153f] bg-white overflow-hidden">
        <ul className="flex flex-col">
          {visibleTreatments.map((s, index, arr) => (
            <li 
              key={s.id} 
              className={index !== arr.length - 1 || totalPages > 1 ? "border-b border-brand-200/60" : ""}
            >
              <Link 
                href={`/treatments/${s.slug}`}
                className="block px-4 py-3.5 font-medium text-slate-700 transition-all duration-300 hover:-translate-y-1 hover:bg-[#17153f] hover:text-white hover:font-bold hover:shadow-lg"
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-slate-50 px-4 py-3 border-t border-brand-200/60">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-slate-500">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
