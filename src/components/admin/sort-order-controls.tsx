"use client";

import { useTransition, useState } from "react";
import { IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import { updateSortOrder } from "@/app/admin/(panel)/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SortOrderControlsProps {
  table: string;
  id: string;
  currentOrder: number;
}

export function SortOrderControls({ table, id, currentOrder }: SortOrderControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticOrder, setOptimisticOrder] = useState(currentOrder);
  const router = useRouter();

  const handleUpdate = (delta: number) => {
    const newOrder = Math.max(0, optimisticOrder + delta);
    setOptimisticOrder(newOrder);
    
    startTransition(async () => {
      const res = await updateSortOrder(table, id, newOrder);
      if (res?.error) {
        toast.error("Failed to update sort order");
        setOptimisticOrder(currentOrder); // revert
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1 border border-slate-200">
      <div className="px-2 font-mono text-xs font-medium text-slate-600 min-w-[3ch] text-center">
        {optimisticOrder}
      </div>
      <div className="flex flex-col">
        <button
          onClick={() => handleUpdate(1)}
          disabled={isPending}
          className="p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded disabled:opacity-50"
          title="Increase sort order (moves down)"
        >
          <IconChevronUp size={14} />
        </button>
        <button
          onClick={() => handleUpdate(-1)}
          disabled={isPending || optimisticOrder <= 0}
          className="p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded disabled:opacity-50"
          title="Decrease sort order (moves up)"
        >
          <IconChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}
