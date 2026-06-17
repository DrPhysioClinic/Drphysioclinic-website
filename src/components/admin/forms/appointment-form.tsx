"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveAppointment } from "@/app/admin/(panel)/actions";
import { emptySave } from "@/app/admin/(panel)/form-state";
import { SaveBar } from "@/components/admin/fields";
import type { Appointment } from "@/types/database";

export function AppointmentForm({ appt }: { appt: any }) {
  const [state, action] = useActionState(saveAppointment, emptySave);

  return (
    <form action={action} className="card space-y-6">
      <input type="hidden" name="id" value={appt.id} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Preferred Date</label>
          <input
            type="date"
            name="preferred_date"
            defaultValue={appt.preferred_date || ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Preferred Time</label>
          <input
            type="text"
            name="preferred_time"
            placeholder="e.g. 14:30 or 02:30 PM"
            defaultValue={appt.preferred_time ? appt.preferred_time.substring(0, 5) : ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Notes / Remarks</label>
        <textarea
          name="notes"
          defaultValue={appt.notes || ""}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <SubmitButton />
        <a href="/admin/appointments" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Cancel
        </a>
      </div>
      
      {state.error && <p className="text-sm text-red-600 mt-2">{state.error}</p>}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" formNoValidate disabled={pending} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}
