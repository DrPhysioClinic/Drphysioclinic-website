"use client";

import Link from "next/link";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function HeroBookAppointmentButton() {
  return (
    <MagneticButton strength={0.4} maxDistance={60}>
      <Link
        href="/contact#appointment"
        className="cursor-pointer block rounded-xl bg-brand-600 px-8 py-3.5 text-lg font-bold text-white shadow-xl ring-1 ring-white/20 ring-offset-2 ring-offset-slate-900 transition-all duration-300 hover:bg-brand-500 hover:shadow-2xl hover:shadow-brand-500/40 active:scale-95"
      >
        Book Appointment
      </Link>
    </MagneticButton>
  );
}
