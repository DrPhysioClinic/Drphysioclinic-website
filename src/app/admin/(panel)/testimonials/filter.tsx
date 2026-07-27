"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TestimonialFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter") || "all";

  return (
    <select
      className="text-xs border-slate-200 rounded-md py-1 pl-2 pr-6 focus:ring-brand-500 focus:border-brand-500 text-slate-700 font-normal"
      value={currentFilter}
      onChange={(e) => {
        const val = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (val === "all") {
          params.delete("filter");
        } else {
          params.set("filter", val);
        }
        router.push(`?${params.toString()}`);
      }}
    >
      <option value="all">All</option>
      <option value="featured">Featured</option>
    </select>
  );
}
