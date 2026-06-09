"use client";

import { useTransition } from "react";
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
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) =>
        startTransition(() => setLeadStatus(table, id, e.target.value))
      }
      className="rounded-md border border-slate-300 px-2 py-1 text-xs capitalize"
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
