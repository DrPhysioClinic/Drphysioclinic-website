"use client";

import { useState, useTransition } from "react";
import { setLeadStatus } from "@/app/admin/(panel)/actions";
import { LEAD_STATUSES } from "@/lib/constants";

export function StatusSelect({
  table,
  id,
  value,
}: {
  table: "appointments" | "enquiries";
  id: string;
  value: string;
}) {
  const [currentValue, setCurrentValue] = useState(value);
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative inline-block w-full sm:w-auto">
      <select
        value={currentValue}
        disabled={pending}
        onChange={(e) => {
          const val = e.target.value;
          setCurrentValue(val);
          startTransition(async () => {
            const res = await setLeadStatus(table, id, val);
            if (res?.error) {
              alert(res.error);
              // Reset to previous value on error
              setCurrentValue(value);
            }
          });
        }}
        className="appearance-none w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 cursor-pointer capitalize"
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s} className="bg-white text-slate-700 font-medium">
            {s}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </div>
    </div>
  );
}
