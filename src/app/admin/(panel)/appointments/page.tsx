import { createServerSupabase } from "@/lib/supabase/server";
import { StatusSelect } from "@/components/admin/status-select";
import { RowActions } from "@/components/admin/row-actions";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("appointments")
    .select(
      "id, patient_name, phone, email, preferred_date, preferred_time, status, notes, consultation_type, zoom_start_url, created_at, services(title)"
    )
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Appointments</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Preferred</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data ?? []).map((a) => {
              const service = a.services as { title?: string | null } | null;
              return (
                <tr key={a.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{a.patient_name}</p>
                    {a.notes && <p className="mt-1 max-w-xs text-xs text-slate-400">{a.notes}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <a href={`tel:${a.phone}`} className="block text-brand-700">{a.phone}</a>
                    {a.email && <span className="text-xs text-slate-400">{a.email}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{service?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {a.preferred_date ?? "—"} {a.preferred_time ?? ""}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {a.consultation_type === 'online' && a.status === 'confirmed' && a.zoom_start_url ? (
                      <a href={a.zoom_start_url} target="_blank" rel="noopener noreferrer" className="inline-block rounded bg-blue-600 px-3 py-1 text-xs font-semibold tracking-wide text-white hover:bg-blue-700 shadow-sm transition-colors">
                        ▶ Start Video Call
                      </a>
                    ) : (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${a.consultation_type === 'online' ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10' : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10'}`}>
                        {a.consultation_type === 'online' ? 'Online Video' : 'In Clinic'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusSelect table="appointments" id={a.id} value={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <RowActions 
                        table="appointments" 
                        id={a.id} 
                        listPath="/admin/appointments" 
                        editHref={`/admin/appointments/${a.id}/edit`} 
                        showPublish={false} 
                        showFeatured={false} 
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!data || data.length === 0) && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No appointments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
