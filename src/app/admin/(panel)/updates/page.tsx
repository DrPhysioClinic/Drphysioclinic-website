import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { RowActions } from "@/components/admin/row-actions";

export const dynamic = "force-dynamic";

export default async function AdminUpdatesPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("updates")
    .select("id, title, published_at, is_published, is_featured")
    .order("published_at", { ascending: false, nullsFirst: false });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Updates</h1>
        <Link href="/admin/updates/new" className="btn-primary">+ New Post</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{u.title}</td>
                <td className="px-4 py-3 text-slate-500">
                  {u.published_at ? new Date(u.published_at).toLocaleDateString("en-IN") : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowActions
                      table="updates"
                      id={u.id}
                      listPath="/admin/updates"
                      editHref={`/admin/updates/${u.id}/edit`}
                      isPublished={u.is_published}
                      isFeatured={u.is_featured}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No updates yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
