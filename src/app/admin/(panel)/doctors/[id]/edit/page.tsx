import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { DoctorForm } from "@/components/admin/forms/doctor-form";

export const dynamic = "force-dynamic";

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: doctor } = await supabase.from("doctors").select("*").eq("id", id).maybeSingle();
  if (!doctor) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/doctors" className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600">← Back to Doctors</Link>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Edit Doctor</h1>
      <DoctorForm doctor={doctor} />
    </div>
  );
}
