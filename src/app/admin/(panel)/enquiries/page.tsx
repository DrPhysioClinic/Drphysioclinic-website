import { createServerSupabase } from "@/lib/supabase/server";
import { StatusSelect } from "@/components/admin/status-select";

export const dynamic = "force-dynamic";

export default async function AdminEnquiriesPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("enquiries")
    .select("id, name, contact, message, source_page, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Enquiries</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((e) => (
              <tr key={e.id} className="align-top">
                <td className="px-4 py-3 font-medium text-slate-800">{e.name}</td>
                <td className="px-4 py-3 text-brand-700">{e.contact}</td>
                <td className="px-4 py-3 max-w-sm text-slate-600">{e.message}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{e.source_page}</td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {new Date(e.created_at).toLocaleDateString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <StatusSelect table="enquiries" id={e.id} value={e.status} />
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No enquiries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
