import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { RowActions } from "@/components/admin/row-actions";
import { SyncButton } from "@/components/admin/sync-button";
import { TestimonialFilter } from "./filter";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createServerSupabase();
  let q = supabase
    .from("testimonials")
    .select("id, patient_name, treatment_category, rating, is_published, is_featured, source")
    .order("sort_order", { ascending: true });

  if (resolvedSearchParams.filter === "featured") {
    q = q.eq("is_featured", true);
  }

  const { data } = await q;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Testimonials</h1>
        <div>
          <SyncButton />
          <Link href="/admin/testimonials/new" className="btn-primary">+ New Testimonial</Link>
        </div>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <TestimonialFilter />
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{t.patient_name}</td>
                <td className="px-4 py-3 text-slate-500">{t.treatment_category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${t.source === 'google' ? 'bg-brand-100 text-brand-800' : t.source === 'google_removed' ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-700'}`}>
                    {t.source === 'google' ? 'Google' : t.source === 'google_removed' ? 'Google (Removed)' : 'Manual'}
                  </span>
                </td>
                <td className="px-4 py-3 text-accent-500">{"★".repeat(t.rating ?? 0)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowActions
                      table="testimonials"
                      id={t.id}
                      listPath="/admin/testimonials"
                      editHref={`/admin/testimonials/${t.id}/edit`}
                      isPublished={t.is_published ?? false}
                      isFeatured={t.is_featured ?? false}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No testimonials yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
