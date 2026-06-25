import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { RowActions } from "@/components/admin/row-actions";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const supabase = await createServerSupabase();
  const { data: services } = await supabase
    .from("services")
    .select("id, title, category, price, is_published, is_featured, sort_order, scheduled_at")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Services</h1>
        <Link href="/admin/services/new" className="btn-primary">
          + New Service
        </Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(services ?? []).map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {s.title}
                  {s.scheduled_at && new Date(s.scheduled_at) > new Date() && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      Scheduled: {new Date(s.scheduled_at).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">{s.category}</td>
                <td className="px-4 py-3 text-slate-500">{s.price != null ? `₹${s.price}` : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowActions
                      table="services"
                      id={s.id}
                      listPath="/admin/services"
                      editHref={`/admin/services/${s.id}/edit`}
                      isPublished={s.is_published ?? false}
                      isFeatured={s.is_featured ?? false}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(!services || services.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No services yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
