"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch('/api/cron/sync-reviews', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert("Sync failed: " + (data.error || "Unknown error"));
      } else {
        alert(`Sync successful! Fetched: ${data.results.fetched}, Inserted: ${data.results.inserted}, Updated: ${data.results.updated}, Flagged removed: ${data.results.flagged}`);
        router.refresh();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleSync} disabled={loading} className="btn-outline mr-2 border-brand-200 text-brand-700 hover:bg-brand-50">
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? "Syncing..." : "Sync Google Reviews"}
    </button>
  );
}
