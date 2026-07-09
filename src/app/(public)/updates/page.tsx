import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/utils";
import { getUpdates } from "@/lib/queries";
import { UpdateCard } from "@/components/public/cards";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const revalidate = 3600;

export async function generateMetadata(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? searchParams.page : undefined;
  const canonicalPath = page && page !== "1" ? `/updates?page=${page}` : "/updates";

  return {
    title: "Physiotherapy Blog & Health Updates",
    description:
      "Read expert physiotherapy articles, health tips, and clinic updates from Dr Jeetendra Brahmbhatt at Dr Physio in Bopal, Ahmedabad.",
    alternates: { canonical: getCanonicalUrl(canonicalPath) },
  };
}

// Helper for complex pagination logic like MUI
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

export default async function UpdatesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  let updates = await getUpdates();
  const doctors = await import("@/lib/queries").then(m => m.getDoctors());
  
  const categoryParam = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  
  if (categoryParam) {
    updates = updates.filter(u => u.category === categoryParam);
  }

  const pageParam = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  
  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(updates.length / ITEMS_PER_PAGE);
  
  if (currentPage > totalPages && totalPages > 0) {
    redirect("/updates" + (categoryParam ? `?category=${categoryParam}` : ""));
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUpdates = updates.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const paginationRange = generatePagination(currentPage, totalPages);
  
  const CATEGORIES = ["Conditions & Recovery", "Exercise & Prevention", "Clinic News"];

  return (
    <div className="container-page pt-28 pb-12">
      <h1 className="section-title">Updates &amp; Health Tips</h1>
      
      <div className="mt-8 flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-slate-500 mr-2">Filter:</span>
        <Link 
          href="/updates" 
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!categoryParam ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          All
        </Link>
        {CATEGORIES.map(c => (
          <Link 
            key={c}
            href={`/updates?category=${encodeURIComponent(c)}`} 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${categoryParam === c ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {currentUpdates.map((u) => (
          <UpdateCard key={u.id} update={u} author={doctors.find(d => d.id === u.author_id)} />
        ))}
        {currentUpdates.length === 0 && (
          <p className="col-span-full text-slate-500">No updates found for this category.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={currentPage > 1 ? `/updates?page=${currentPage - 1}` : "#"} 
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {paginationRange.map((page, i) => (
                <PaginationItem key={i}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink 
                      href={`/updates?page=${page}`} 
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  href={currentPage < totalPages ? `/updates?page=${currentPage + 1}` : "#"} 
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
