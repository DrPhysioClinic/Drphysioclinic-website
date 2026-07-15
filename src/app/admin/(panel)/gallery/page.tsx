import Link from "next/link";
import Image from "next/image";
import { createServerSupabase } from "@/lib/supabase/server";
import { RowActions } from "@/components/admin/row-actions";
import { SortOrderControls } from "@/components/admin/sort-order-controls";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("gallery")
    .select("id, title, image_url, category, is_published, is_featured, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Gallery</h1>
        <Link href="/admin/gallery/new" className="btn-primary">+ Add Photo</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((g) => (
          <div key={g.id} className="card overflow-hidden flex flex-col">
            <div className="relative aspect-video bg-slate-100">
              <Image src={g.image_url} alt={g.title || "Photo"} fill sizes="33vw" className="object-cover" unoptimized />
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <p className="truncate font-medium text-slate-800">{g.title || "Untitled"}</p>
              <p className="text-xs text-slate-500 mb-2">{g.category || "No category"}</p>
              <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
                <SortOrderControls table="gallery" id={g.id} currentOrder={g.sort_order ?? 0} />
                <RowActions
                  table="gallery"
                  id={g.id}
                  listPath="/admin/gallery"
                  editHref={`/admin/gallery/${g.id}/edit`}
                  isPublished={g.is_published ?? false}
                  isFeatured={g.is_featured ?? false}
                />
              </div>
            </div>
          </div>
        ))}
        {(!data || data.length === 0) && (
          <p className="text-slate-400">No photos yet.</p>
        )}
      </div>
    </div>
  );
}
