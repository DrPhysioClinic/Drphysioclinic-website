import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { RowActions } from "@/components/admin/row-actions";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("testimonials")
    .select("id, patient_name, treatment_category, rating, is_published, is_featured")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Testimonials</h1>
        <Link href="/admin/testimonials/new" className="btn-primary">+ New Testimonial</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{t.patient_name}</td>
                <td className="px-4 py-3 text-slate-500">{t.treatment_category}</td>
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
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No testimonials yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
