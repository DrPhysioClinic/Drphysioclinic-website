import { createServerSupabase } from "@/lib/supabase/server";
import { StatusSelect } from "@/components/admin/status-select";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("appointments")
    .select(
      "id, patient_name, phone, email, preferred_date, preferred_time, payment_mode, status, notes, created_at, services(title)"
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
              <th className="px-4 py-3">Pay</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status</th>
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
                  <td className="px-4 py-3 text-slate-500">{a.payment_mode ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(a.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusSelect table="appointments" id={a.id} value={a.status} />
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
