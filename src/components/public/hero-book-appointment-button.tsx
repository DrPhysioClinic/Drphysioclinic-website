"use client";

import Link from "next/link";
import { MagneticButton } from "@/components/ui/magnetic-button";

import { ArrowRight } from "lucide-react";

export function HeroBookAppointmentButton() {
  return (
    <MagneticButton strength={0.4} maxDistance={60}>
      <Link
        href="/contact#appointment"
        className="cursor-pointer flex items-center gap-4 rounded-full bg-[#F2F0E9] pl-7 pr-2.5 py-2.5 text-[17px] font-semibold text-slate-900 shadow-xl ring-1 ring-white/20 ring-offset-2 ring-offset-[#17153f] transition-all duration-300 hover:bg-white hover:shadow-2xl active:scale-95 group"
      >
        <span>Book Appointment</span>
        <div className="w-11 h-11 rounded-full bg-slate-950 flex items-center justify-center text-white">
          <ArrowRight strokeWidth={2.5} className="w-[22px] h-[22px] transition-transform duration-300 group-hover:-rotate-45" />
        </div>
      </Link>
    </MagneticButton>
  );
}
