import Link from "next/link";
import { DoctorForm } from "@/components/admin/forms/doctor-form";

export const dynamic = "force-dynamic";

export default function NewDoctorPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/doctors" className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600">← Back to Doctors</Link>
      <h1 className="mb-4 text-xl font-bold text-slate-900">New Doctor</h1>
      <DoctorForm />
    </div>
  );
}
