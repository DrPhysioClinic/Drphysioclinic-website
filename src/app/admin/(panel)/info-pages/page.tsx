import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { RowActions } from "@/components/admin/row-actions";

export const dynamic = "force-dynamic";

export default async function AdminInfoPagesPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("info_pages")
    .select("id, title, slug, is_published")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Info Pages</h1>
        <Link href="/admin/info-pages/new" className="btn-primary">+ New Page</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{p.title}</td>
                <td className="px-4 py-3 text-slate-500">/info/{p.slug}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowActions
                      table="info_pages"
                      id={p.id}
                      listPath="/admin/info-pages"
                      editHref={`/admin/info-pages/${p.id}/edit`}
                      isPublished={p.is_published}
                      showFeatured={false}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No info pages yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
