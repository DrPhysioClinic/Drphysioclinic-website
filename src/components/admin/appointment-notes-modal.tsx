"use client";

import { useState, useTransition } from "react";
import { saveDoctorNotes } from "@/app/admin/(panel)/actions";
import { IconNotes } from "@tabler/icons-react";

export function AppointmentNotesModal({
  id,
  patientNotes,
  initialDoctorNotes,
}: {
  id: string;
  patientNotes: string | null;
  initialDoctorNotes: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(initialDoctorNotes || "");
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveDoctorNotes(id, notes);
      if (res?.error) {
        alert(res.error);
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Doctor Notes"
        className="rounded border border-yellow-300 bg-yellow-50 p-1.5 text-yellow-700 hover:bg-yellow-100 transition-colors"
      >
        <IconNotes className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Modal box */}
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Appointment Notes</h2>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-600">Patient's Remarks</label>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                {patientNotes || <span className="italic text-slate-400">No remarks provided.</span>}
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-slate-700">Doctor's Private Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your private notes here..."
                rows={4}
                className="w-full rounded-md border border-slate-300 p-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <p className="mt-1 text-xs text-slate-500">These notes are strictly private and not visible to the patient.</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={pending}
                onClick={handleSave}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {pending ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
