import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { AppointmentForm } from "@/components/admin/forms/appointment-form";

export const dynamic = "force-dynamic";

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: appt } = await supabase.from("appointments").select("*").eq("id", id).single();

  if (!appt) notFound();

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">
        Reschedule Appointment
      </h1>
      <p className="mb-4 text-sm text-slate-600">
        Patient: <strong>{appt.patient_name}</strong> | Type: {appt.consultation_type === 'online' ? 'Online Video' : 'In Clinic'}
      </p>

      <AppointmentForm appt={appt} />
    </div>
  );
}
