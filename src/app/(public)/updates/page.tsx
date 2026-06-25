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

export const metadata: Metadata = {
  title: "Updates & Health Tips",
  description: "News, health tips and articles from Dr Physio, Ahmedabad.",
};

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
  const updates = await getUpdates();

  const pageParam = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  
  const ITEMS_PER_PAGE = 9;
  const totalPages = Math.ceil(updates.length / ITEMS_PER_PAGE);
  
  if (currentPage > totalPages && totalPages > 0) {
    redirect("/updates");
  }

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentUpdates = updates.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const paginationRange = generatePagination(currentPage, totalPages);

  return (
    <div className="container-page pt-28 pb-12">
      <h1 className="section-title">Updates &amp; Health Tips</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {currentUpdates.map((u) => (
          <UpdateCard key={u.id} update={u} />
        ))}
        {currentUpdates.length === 0 && (
          <p className="col-span-full text-slate-500">No updates published yet.</p>
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
