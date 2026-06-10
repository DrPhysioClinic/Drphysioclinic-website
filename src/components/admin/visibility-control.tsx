"use client";

import { useState, useEffect } from "react";

type VisibilityOption = "publish" | "draft" | "schedule";

export function VisibilityControl({
  initialIsPublished,
  initialScheduledAt,
}: {
  initialIsPublished: boolean;
  initialScheduledAt: string | null | undefined;
}) {
  const [option, setOption] = useState<VisibilityOption>(() => {
    if (initialIsPublished) {
      return initialScheduledAt ? "schedule" : "publish";
    }
    return "draft";
  });

  // Keep a local datetime string (YYYY-MM-DDTHH:MM) in local timezone
  const [localDateTime, setLocalDateTime] = useState<string>(() => {
    if (initialScheduledAt) {
      // Parse UTC into local string for datetime-local
      const d = new Date(initialScheduledAt);
      if (!isNaN(d.getTime())) {
        // format as YYYY-MM-DDTHH:MM local
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      }
    }
    return "";
  });

  // Derived UTC string to pass to server
  const [utcDateTime, setUtcDateTime] = useState<string>(initialScheduledAt || "");

  useEffect(() => {
    if (option === "schedule" && localDateTime) {
      const d = new Date(localDateTime);
      if (!isNaN(d.getTime())) {
        setUtcDateTime(d.toISOString());
      } else {
        setUtcDateTime("");
      }
    } else {
      setUtcDateTime("");
    }
  }, [option, localDateTime]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-slate-700">Visibility</label>
        <select
          className="input max-w-sm"
          value={option}
          onChange={(e) => setOption(e.target.value as VisibilityOption)}
        >
          <option value="publish">Publish Now</option>
          <option value="draft">Draft (Hidden)</option>
          <option value="schedule">Schedule for later</option>
        </select>
      </div>

      {option === "schedule" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Scheduled Date & Time (Your Local Time)</label>
          <input
            type="datetime-local"
            className="input max-w-sm"
            value={localDateTime}
            onChange={(e) => setLocalDateTime(e.target.value)}
            required={option === "schedule"}
          />
          <p className="text-xs text-slate-500">
            Will automatically go live on this date.
          </p>
        </div>
      )}

      {/* Hidden inputs for the Server Action to read */}
      <input type="hidden" name="is_published" value={option !== "draft" ? "true" : "false"} />
      <input type="hidden" name="scheduled_at" value={option === "schedule" ? utcDateTime : ""} />
    </div>
  );
}
