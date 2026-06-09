import { DoctorForm } from "@/components/admin/forms/doctor-form";

export const dynamic = "force-dynamic";

export default function NewDoctorPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-slate-900">New Doctor</h1>
      <DoctorForm />
    </div>
  );
}
