"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_LINKS, telHref } from "@/lib/constants";
import { TrackLink } from "@/components/public/track-link";

export function SiteHeader({
  clinicName,
  phone,
}: {
  clinicName: string;
  phone?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            +
          </span>
          <span className="hidden text-base leading-tight sm:block">{clinicName}</span>
          <span className="text-base leading-tight sm:hidden">Dr Physio</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-brand-700" : "text-slate-600 hover:text-brand-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <TrackLink
            href={telHref(phone)}
            eventType="call_click"
            sourcePage="header"
            className="hidden btn-outline sm:inline-flex"
          >
            📞 Call Now
          </TrackLink>
          <Link href="/contact#appointment" className="hidden btn-accent sm:inline-flex">
            Book Appointment
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            className="rounded-md p-2 text-slate-700 lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-page flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
