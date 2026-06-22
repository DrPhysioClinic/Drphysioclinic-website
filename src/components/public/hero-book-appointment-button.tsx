"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useHeroInView } from "@/lib/hero-state";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export function HeroBookAppointmentButton() {
  const inView = useHeroInView();

  return (
    <AnimatePresence>
      {inView && (
        <motion.div
          layoutId="book-appointment-btn"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <HoverBorderGradient
            as={Link}
            href="/contact#appointment"
            containerClassName="flex rounded-xl"
            className="transition-colors font-semibold bg-transparent text-white hover:bg-white/10"
            duration={1.5}
          >
            Book Appointment
          </HoverBorderGradient>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
