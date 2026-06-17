import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { Metadata } from "next";
import { getUpdates } from "@/lib/queries";
import { UpdateCard } from "@/components/public/cards";
import Link from "next/link";
import { redirect } from "next/navigation";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Updates & Health Tips",
  description: "News, health tips and articles from Dr Physio, Ahmedabad.",
};

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
        <div className="mt-12 flex items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={`/updates?page=${currentPage - 1}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-brand-600"
            >
              <IconChevronLeft size={20} />
            </Link>
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 opacity-50 cursor-not-allowed">
              <IconChevronLeft size={20} />
            </span>
          )}
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/updates?page=${p}`}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  currentPage === p
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>

          {currentPage < totalPages ? (
            <Link
              href={`/updates?page=${currentPage + 1}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-brand-600"
            >
              <IconChevronRight size={20} />
            </Link>
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 opacity-50 cursor-not-allowed">
              <IconChevronRight size={20} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
