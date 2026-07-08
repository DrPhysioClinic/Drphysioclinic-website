"use client";

import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

import type { Testimonial as DBTestimonial } from "@/types/database";

export const TestimonialsSection = ({ testimonials = [] }: { testimonials?: DBTestimonial[] }) => {
  const mappedTestimonials = testimonials.map(t => ({
    text: t.testimonial,
    image: t.image_url || "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E", // Fallback image
    name: t.patient_name,
    role: t.treatment_category || "Patient",
  }));

  // Duplicate testimonials if we don't have enough to fill the scrolling columns
  const displayTestimonials = mappedTestimonials.length >= 9 
    ? mappedTestimonials 
    : [...mappedTestimonials, ...mappedTestimonials, ...mappedTestimonials].slice(0, Math.max(9, mappedTestimonials.length * 3));

  // If there are no testimonials at all, fallback to a single empty item or handle gracefully
  if (displayTestimonials.length === 0) {
    return null; // Or return a fallback UI
  }

  const itemsPerColumn = Math.ceil(displayTestimonials.length / 3);
  const firstColumn = displayTestimonials.slice(0, itemsPerColumn);
  const secondColumn = displayTestimonials.slice(itemsPerColumn, itemsPerColumn * 2);
  const thirdColumn = displayTestimonials.slice(itemsPerColumn * 2);

  return (
    <section className="bg-slate-50 py-20 relative overflow-hidden border-t border-slate-200">
      <div className="container-page relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[640px] mx-auto text-center"
        >
          <div className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 mb-6">
            Testimonials
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            What our patients say
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Real stories of recovery and renewed strength from the people we care for.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-14 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[640px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={25} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={35} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={28} />
        </div>
      </div>
    </section>
  );
};
