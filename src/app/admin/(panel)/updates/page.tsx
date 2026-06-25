import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { RowActions } from "@/components/admin/row-actions";

export const dynamic = "force-dynamic";

export default async function AdminUpdatesPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("updates")
    .select("id, title, published_at, is_published, is_featured, scheduled_at")
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
                <td className="px-4 py-3 font-medium text-slate-800">
                  {u.title}
                  {u.scheduled_at && new Date(u.scheduled_at) > new Date() && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      Scheduled: {new Date(u.scheduled_at).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}
                    </span>
                  )}
                </td>
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
                      isPublished={u.is_published ?? false}
                      isFeatured={u.is_featured ?? false}
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
