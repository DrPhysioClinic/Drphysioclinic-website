"use client";

import { useState, useEffect, useRef } from "react";
import { IconBell, IconCheck } from "@tabler/icons-react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead } from "@/app/admin/(panel)/notifications-actions";
import { useRouter } from "next/navigation";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createBrowserSupabase();

  useEffect(() => {
    // Fetch initial
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("admin_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNotif = payload.new;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((c) => c + 1);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          const updated = payload.new;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          if (updated.is_read) {
            setUnreadCount((c) => Math.max(0, c - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await markAllNotificationsRead();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="group relative p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <IconBell className="w-5 h-5 text-slate-600 group-hover:animate-shake origin-top" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
              >
                <IconCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[24rem] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="bg-slate-100 p-3 rounded-full mb-3">
                  <IconBell className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No new notifications.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 transition-colors hover:bg-slate-50 ${
                      !n.is_read ? "bg-brand-50/40" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {n.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 leading-snug">
                          {n.message}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-400">
                            {new Date(n.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </span>
                          <div className="flex items-center gap-4">
                            {!n.is_read && (
                              <button
                                onClick={() => handleMarkRead(n.id)}
                                className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                              >
                                Mark read
                              </button>
                            )}
                            {n.link && (
                              <button
                                onClick={() => {
                                  if (!n.is_read) handleMarkRead(n.id);
                                  setOpen(false);
                                  router.push(n.link);
                                }}
                                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm"
                              >
                                View
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
