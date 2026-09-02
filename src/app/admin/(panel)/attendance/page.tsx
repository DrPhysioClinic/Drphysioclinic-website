import { createServerSupabase } from "@/lib/supabase/server";
import { Metadata } from "next";
import { AttendanceClient } from "@/components/admin/attendance-client";

export const metadata: Metadata = {
  title: "Attendance | Admin Panel",
};

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const supabase = await createServerSupabase();

  const { data: attendances, error } = await supabase
    .from("attendances")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching attendances:", error);
  }

  return (
    <div className="flex h-full w-full flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Attendance Register</h1>
        <p className="text-sm text-slate-500 mt-1">Track patient and external visitor attendance.</p>
      </div>

      <div className="relative flex-1 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <AttendanceClient initialData={attendances || []} />
      </div>
    </div>
  );
}
