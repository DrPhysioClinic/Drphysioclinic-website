"use client";

import { useActionState, useState } from "react";
import { submitAttendance } from "@/app/actions/forms";

const initialState = { ok: false, message: "" };

export function AttendanceForm() {
  const [state, formAction, pending] = useActionState(submitAttendance, initialState);
  const [hasCode, setHasCode] = useState(true);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center shadow-sm">
        <h3 className="mb-2 text-2xl font-semibold text-brand-900">Success!</h3>
        <p className="text-brand-700">{state.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Honeypot field to stop bots */}
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

      {/* Date Field (always visible) */}
      <div>
        <label htmlFor="attendance_date" className="mb-1.5 block text-sm font-medium text-slate-700">
          Visit Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="attendance_date"
          id="attendance_date"
          required
          defaultValue={new Date().toISOString().split('T')[0]} // Default to today
          max={new Date().toISOString().split('T')[0]} // Prevent future dates
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="hasCode"
          checked={hasCode}
          onChange={(e) => setHasCode(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600"
        />
        <label htmlFor="hasCode" className="text-sm font-medium text-slate-700">
          I have a Unique Code
        </label>
      </div>

      {hasCode ? (
        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-slate-700">
            Unique Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="code"
            id="code"
            required={hasCode}
            placeholder="e.g. A7B9X2"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 uppercase"
          />
          <p className="mt-1 text-xs text-slate-500">Your unique 6-character code provided by the clinic.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required={!hasCode}
              placeholder="John Doe"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              required={!hasCode}
              placeholder="+91 9876543210"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      )}

      {state.message && !state.ok && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{state.message}</div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-600 px-6 py-4 text-center font-semibold text-white shadow-md transition-all hover:bg-brand-700 hover:shadow-lg disabled:opacity-70"
      >
        {pending ? "Submitting..." : "Submit Attendance"}
      </button>
    </form>
  );
}
