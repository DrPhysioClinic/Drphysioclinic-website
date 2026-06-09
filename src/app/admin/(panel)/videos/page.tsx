import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { RowActions } from "@/components/admin/row-actions";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("videos")
    .select("id, title, category, is_published, is_featured")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Videos</h1>
        <Link href="/admin/videos/new" className="btn-primary">+ New Video</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{v.title}</td>
                <td className="px-4 py-3 text-slate-500">{v.category}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowActions
                      table="videos"
                      id={v.id}
                      listPath="/admin/videos"
                      editHref={`/admin/videos/${v.id}/edit`}
                      isPublished={v.is_published}
                      isFeatured={v.is_featured}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No videos yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
