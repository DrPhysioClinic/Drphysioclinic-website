"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type StatRow = {
  month_start: string;
  unique_visitors: number;
  total_pageviews: number;
};

export function AnalyticsDashboard({
  uniqueVisitors,
  totalPageviews,
  monthlyData,
}: {
  uniqueVisitors: number;
  totalPageviews: number;
  monthlyData: StatRow[];
}) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    
    // Subscribe to new pageviews for realtime updates
    const channel = supabase
      .channel("analytics_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analytics_events",
          filter: "event_type=eq.pageview",
        },
        () => {
          if (!isRefreshing) {
            setIsRefreshing(true);
            router.refresh();
            // Throttle to prevent multiple rapid re-fetches
            setTimeout(() => setIsRefreshing(false), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, isRefreshing]);

  // Format numbers to "1k", "1.5k" for clean axes when traffic grows
  const formatCompactNumber = (number: any) => {
    if (typeof number !== "number" || isNaN(number)) return number;
    return Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(number);
  };

  // Format "YYYY-MM" to "Jun 26" for a cleaner X-axis
  const formatMonth = (monthStr: any) => {
    if (typeof monthStr !== "string") return monthStr;
    const parts = monthStr.split("-");
    if (parts.length !== 2) return monthStr;
    const [year, month] = parts;
    const date = new Date(parseInt(year), parseInt(month) - 1);
    if (isNaN(date.getTime())) return monthStr;
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-slate-900">Website Traffic (Last 12 Months)</h2>
      
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Unique Visitors Chart Card */}
        <div className="card transition-shadow hover:shadow-md">
          <div className="p-5 pb-0">
            <div className="text-3xl font-bold text-brand-700">{Intl.NumberFormat("en-US").format(uniqueVisitors)}</div>
            <div className="mt-1 text-sm font-medium text-slate-500">Unique Visitors</div>
          </div>
          {monthlyData.length > 0 ? (
            <div className="h-48 w-full p-4 pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month_start" 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={formatMonth}
                    tick={{ fontSize: 12, fill: "#64748b" }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={formatCompactNumber}
                    tick={{ fontSize: 12, fill: "#64748b" }} 
                  />
                  <Tooltip
                    labelFormatter={formatMonth}
                    formatter={(value: any) => [typeof value === "number" ? Intl.NumberFormat("en-US").format(value) : value, "Unique Visitors"]}
                    cursor={{ stroke: "#e2e8f0", strokeWidth: 1, strokeDasharray: "3 3" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Line type="monotone" dataKey="unique_visitors" name="Unique Visitors" stroke="#0369a1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">No data</div>
          )}
        </div>

        {/* Page Views Chart Card */}
        <div className="card transition-shadow hover:shadow-md">
          <div className="p-5 pb-0">
            <div className="text-3xl font-bold text-brand-700">{Intl.NumberFormat("en-US").format(totalPageviews)}</div>
            <div className="mt-1 text-sm font-medium text-slate-500">Page Views</div>
          </div>
          {monthlyData.length > 0 ? (
            <div className="h-48 w-full p-4 pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month_start" 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={formatMonth}
                    tick={{ fontSize: 12, fill: "#64748b" }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={formatCompactNumber}
                    tick={{ fontSize: 12, fill: "#64748b" }} 
                  />
                  <Tooltip
                    labelFormatter={formatMonth}
                    formatter={(value: any) => [typeof value === "number" ? Intl.NumberFormat("en-US").format(value) : value, "Page Views"]}
                    cursor={{ stroke: "#e2e8f0", strokeWidth: 1, strokeDasharray: "3 3" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Line type="monotone" dataKey="total_pageviews" name="Page Views" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}
