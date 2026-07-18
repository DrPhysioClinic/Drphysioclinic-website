"use client";

import { useTransition, useState, useEffect } from "react";
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

  // Keep optimistic state synced if currentOrder prop changes from outside
  useEffect(() => {
    setOptimisticOrder(currentOrder);
  }, [currentOrder]);

  const updateOrder = (newOrder: number) => {
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

  const handleArrowUpdate = (delta: number) => {
    const newOrder = Math.max(0, optimisticOrder + delta);
    updateOrder(newOrder);
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      setOptimisticOrder(val);
    } else {
      setOptimisticOrder(0);
    }
  };

  const submitDirectInput = () => {
    if (optimisticOrder !== currentOrder) {
      updateOrder(optimisticOrder);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1 border border-slate-200">
      <input
        type="number"
        value={optimisticOrder}
        onChange={handleDirectInput}
        onBlur={submitDirectInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        disabled={isPending}
        className="w-10 bg-transparent px-1 font-mono text-xs font-medium text-slate-600 text-center outline-none border-b border-transparent focus:border-brand-500 focus:bg-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <div className="flex flex-col">
        <button
          onClick={() => handleArrowUpdate(1)}
          disabled={isPending}
          className="p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded disabled:opacity-50"
          title="Increase sort order (moves down)"
        >
          <IconChevronUp size={14} />
        </button>
        <button
          onClick={() => handleArrowUpdate(-1)}
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
