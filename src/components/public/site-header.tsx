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
            const active = pathname === link.href || link.sublinks?.some((s) => s.href === pathname);
            if (link.sublinks) {
              return (
                <div key={link.href} className="group relative py-2">
                  <Link
                    href={link.href}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active ? "text-brand-700" : "text-slate-600 group-hover:text-brand-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                  <div className="absolute left-0 top-full hidden w-48 pt-2 group-hover:block">
                    <div className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                      {link.sublinks.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`px-4 py-2 text-sm transition-colors hover:bg-brand-50 hover:text-brand-700 ${
                            pathname === sub.href ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
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
              <div key={link.href} className="flex flex-col">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-brand-50"
                >
                  {link.label}
                </Link>
                {link.sublinks && (
                  <div className="ml-4 flex flex-col border-l-2 border-slate-100 pl-2 mb-2">
                    {link.sublinks.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setOpen(false)}
                        className={`rounded-md px-3 py-2 text-sm transition-colors ${
                          pathname === sub.href ? "text-brand-700 font-medium bg-brand-50" : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
