"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteRow, toggleField } from "@/app/admin/(panel)/actions";
import { IconEdit, IconTrash } from "@tabler/icons-react";

type Table =
  | "services"
  | "doctors"
  | "testimonials"
  | "gallery"
  | "updates"
  | "videos"
  | "info_pages"
  | "appointments";

export function RowActions({
  table,
  id,
  listPath,
  editHref,
  isPublished,
  isFeatured,
  showFeatured = true,
  showPublish = true,
}: {
  table: Table;
  id: string;
  listPath: string;
  editHref?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  showFeatured?: boolean;
  showPublish?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-nowrap items-center gap-2 text-xs">
      {editHref && (
        <Link href={editHref} title="Edit" className="rounded border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
          <IconEdit className="w-4 h-4" />
        </Link>
      )}
      {showPublish && (
        <button
          disabled={pending}
          onClick={() =>
            startTransition(() => toggleField(table, id, "is_published", !isPublished, listPath))
          }
          className={`rounded px-2 py-1 font-medium cursor-pointer hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 transition-opacity ${
            isPublished ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {isPublished ? "Published" : "Draft"}
        </button>
      )}
      {showFeatured && (
        <button
          disabled={pending}
          onClick={() =>
            startTransition(() => toggleField(table, id, "is_featured", !isFeatured, listPath))
          }
          className={`rounded px-2 py-1 font-medium cursor-pointer hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 transition-opacity ${
            isFeatured ? "bg-accent-500 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {isFeatured ? "★ Featured" : "☆ Feature"}
        </button>
      )}
      <button
        disabled={pending}
        title="Delete"
        onClick={() => {
          if (confirm("Delete this item? This cannot be undone.")) {
            startTransition(() => deleteRow(table, id, listPath));
          }
        }}
        className="rounded border border-red-200 p-1.5 text-red-600 hover:bg-red-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        <IconTrash className="w-4 h-4" />
      </button>
    </div>
  );
}
