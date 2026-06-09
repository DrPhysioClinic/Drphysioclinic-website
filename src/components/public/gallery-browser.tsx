"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/types/database";

export function GalleryBrowser({ items }: { items: GalleryItem[] }) {
  const categories = Array.from(
    new Set(items.map((i) => i.category).filter((c): c is string => Boolean(c)))
  ).sort();
  const [active, setActive] = useState<string>("All");
  const filtered = active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active === cat
                  ? "bg-brand-600 text-white"
                  : "border border-slate-300 text-slate-600 hover:border-brand-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((g) => (
          <figure key={g.id} className="group relative aspect-square overflow-hidden rounded-lg bg-brand-50">
            <Image
              src={g.image_url}
              alt={g.alt_text || g.title || "Gallery image"}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
            {g.title && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {g.title}
              </figcaption>
            )}
          </figure>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-slate-500">No photos in this category.</p>
        )}
      </div>
    </div>
  );
}
