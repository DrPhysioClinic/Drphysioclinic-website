"use client";

import { useFormStatus } from "react-dom";
import type { SaveState } from "@/app/admin/(panel)/form-state";

export function Text({
  name,
  label,
  defaultValue,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className="input"
      />
    </div>
  );
}

export function TextArea({
  name,
  label,
  defaultValue,
  rows = 4,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className="input"
      />
    </div>
  );
}

export function Select({
  name,
  label,
  defaultValue,
  options,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue ?? ""} className="input">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4" />
      {label}
    </label>
  );
}

export function SaveBar({ state, label = "Save" }: { state: SaveState; label?: string }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-0 mt-6 flex items-center gap-3 border-t border-slate-200 bg-white py-3">
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Saving…" : label}
      </button>
      {state.error && <span className="text-sm text-red-600">{state.error}</span>}
    </div>
  );
}
