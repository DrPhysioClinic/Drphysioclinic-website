"use client";

import { useState } from "react";
import { ServiceCard } from "@/components/public/cards";
import type { Service } from "@/types/database";

export function TreatmentsBrowser({
  services,
  categories,
}: {
  services: Service[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("All");
  const filtered =
    active === "All" ? services : services.filter((s) => s.category === active);

  return (
    <div>
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

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-slate-500">No treatments in this category.</p>
        )}
      </div>
    </div>
  );
}
