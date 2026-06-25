"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NAV_LINKS, telHref } from "@/lib/constants";
import { TrackLink } from "@/components/public/track-link";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { motion, AnimatePresence } from "motion/react";
import { useHeroInView } from "@/lib/hero-state";

export function SiteHeader({
  clinicName,
  phone,
}: {
  clinicName: string;
  phone?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHeroInView = useHeroInView();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Only use the transparent header on the home page where there is a dark hero section.
  const isHome = pathname === "/";
  const isSolid = scrolled || !isHome || open;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        isSolid 
          ? "bg-white/95 backdrop-blur border-b border-slate-200" 
          : "bg-transparent border-b-transparent py-2"
      }`}
    >
      <div className="w-full px-4 md:px-8 relative flex h-16 items-center">
        <Link href="/" className="flex items-center z-10">
          <div className="relative flex items-center h-10 w-10 sm:h-12 sm:w-12">
            {/* White Icon (logo-13) */}
            <Image 
              src="/icon-white-v2.svg" 
              alt="Icon" 
              fill
              className={`object-contain transition-opacity duration-300 drop-shadow-md ${
                isSolid ? "opacity-0" : "opacity-100"
              }`} 
              priority 
            />
            {/* Purple Icon (logo-11) */}
            <Image 
              src="/icon-primary-v2.svg" 
              alt="Icon" 
              fill
              className={`object-contain transition-opacity duration-300 ${
                isSolid ? "opacity-100" : "opacity-0"
              }`} 
              priority 
            />
          </div>
          <div className="relative flex items-center h-16 w-32 sm:h-20 sm:w-40 ml-1">
            {/* White Text Logo (logo-10) */}
            <Image 
              src="/logo-white-v2.svg" 
              alt={clinicName} 
              fill
              className={`object-contain object-left transition-all duration-300 scale-[2] sm:scale-[2.5] origin-[left_center] drop-shadow-md ${
                isSolid ? "opacity-0" : "opacity-100"
              }`} 
              priority 
            />
            {/* Deep Purple Text Logo (logo-08) */}
            <Image 
              src="/logo-primary-v2.svg" 
              alt={clinicName} 
              fill
              className={`object-contain object-left transition-all duration-300 scale-[2] sm:scale-[2.5] origin-[left_center] ${
                isSolid ? "opacity-100" : "opacity-0"
              }`} 
              priority 
            />
          </div>
        </Link>

        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || link.sublinks?.some((s) => s.href === pathname);
            
            let textColorClass = "";
            if (isSolid) {
              textColorClass = active ? "text-brand-700" : "text-slate-600 hover:text-brand-700";
            } else {
              textColorClass = active ? "text-white font-bold" : "text-white/80 hover:text-white";
            }

            if (link.sublinks) {
              return (
                <div key={link.href} className="group relative py-2">
                  <Link
                    href={link.href}
                    className={`rounded-md px-3 py-2 text-base font-medium transition-colors ${textColorClass}`}
                  >
                    {link.label}
                  </Link>
                  <div className="absolute left-0 top-full w-48 pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                    <div className="flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                      {link.sublinks.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`px-4 py-2 text-base transition-colors hover:bg-brand-50 hover:text-brand-700 ${
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
                className={`rounded-md px-3 py-2 text-base font-medium transition-colors ${textColorClass}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto z-10">
          <TrackLink
            href={telHref(phone)}
            eventType="call_click"
            sourcePage="header"
            className={`group hidden sm:inline-flex items-center justify-center gap-0 transition-all duration-300 ${
              isSolid ? "btn-outline px-3" : "btn border border-white/40 text-white hover:bg-white/10 px-3"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-in-out group-hover:max-w-xs group-hover:ml-2 group-hover:opacity-100">
              Call Now
            </span>
          </TrackLink>
          <AnimatePresence>
            {(!isHome || !isHeroInView) && (
              <motion.div
                layoutId="book-appointment-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="hidden sm:flex"
              >
                <HoverBorderGradient
                  as={Link}
                  href="/contact#appointment"
                  containerClassName="flex rounded-xl"
                  className={`transition-colors font-semibold bg-transparent ${
                    isSolid ? "text-brand-700 hover:bg-brand-50/50" : "text-white hover:bg-white/10"
                  }`}
                  duration={1.5}
                >
                  Book Appointment
                </HoverBorderGradient>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            aria-label="Toggle menu"
            className={`rounded-md p-2 lg:hidden transition-colors ${
              isSolid ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
            }`}
            onClick={() => {
              setOpen((v) => {
                const next = !v;
                if (next) document.body.style.overflow = "hidden";
                else document.body.style.overflow = "";
                return next;
              });
            }}
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
        <nav className="absolute top-full left-0 w-full h-[calc(100vh-64px)] overflow-y-auto bg-white lg:hidden border-t border-slate-200">
          <div className="container-page flex flex-col py-6 gap-2">
            {NAV_LINKS.map((link) => (
              <div key={link.href} className="flex flex-col">
                <Link
                  href={link.href}
                  onClick={() => { setOpen(false); document.body.style.overflow = ""; }}
                  className="rounded-md px-3 py-3 text-lg font-medium text-slate-800 hover:bg-brand-50"
                >
                  {link.label}
                </Link>
                {link.sublinks && (
                  <div className="ml-4 flex flex-col border-l-2 border-slate-100 pl-4 mb-4 mt-2 gap-2">
                    {link.sublinks.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => { setOpen(false); document.body.style.overflow = ""; }}
                        className={`rounded-md px-3 py-2 text-base transition-colors ${
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
