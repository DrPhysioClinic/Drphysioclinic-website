import { Metadata } from "next";
import { AttendanceForm } from "@/components/public/attendance-form";

export const metadata: Metadata = {
  title: "Register Attendance | Dr. Physio Clinic",
  description: "Register your visit attendance at Dr. Physio Clinic.",
};

export default function AttendancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 py-20">
      <div className="w-full max-w-xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Register Attendance
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Please enter your unique code to register your visit.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <AttendanceForm />
        </div>
      </div>
    </main>
  );
}
