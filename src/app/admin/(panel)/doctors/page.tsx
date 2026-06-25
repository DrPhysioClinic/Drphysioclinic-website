import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { RowActions } from "@/components/admin/row-actions";

export const dynamic = "force-dynamic";

export default async function AdminDoctorsPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("doctors")
    .select("id, name, title, is_published, is_featured")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Doctors</h1>
        <Link href="/admin/doctors/new" className="btn-primary">+ New Doctor</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                <td className="px-4 py-3 text-slate-500">{d.title}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowActions
                      table="doctors"
                      id={d.id}
                      listPath="/admin/doctors"
                      editHref={`/admin/doctors/${d.id}/edit`}
                      isPublished={d.is_published ?? false}
                      isFeatured={d.is_featured ?? false}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">No doctors yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
