"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADMIN_NAV_LINKS } from "@/lib/constants";
import { signOut } from "@/app/admin/auth-actions";

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Topbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            className="rounded p-1.5 text-slate-600 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <Link href="/admin" className="font-bold text-brand-700">
            Dr Physio Admin
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/" target="_blank" className="text-slate-500 hover:text-brand-700">
            View site ↗
          </Link>
          <span className="hidden text-slate-400 sm:inline">{userEmail}</span>
          <form action={signOut}>
            <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } fixed inset-y-14 left-0 z-20 w-60 border-r border-slate-200 bg-white p-3 lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)]`}
        >
          <nav className="space-y-1">
            {ADMIN_NAV_LINKS.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
