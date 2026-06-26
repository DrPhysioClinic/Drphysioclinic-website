"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { Doctor } from "@/types/database";

export function DoctorSlider({ doctors }: { doctors: Doctor[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  if (!doctors || doctors.length === 0) return null;

  // Only show navigation arrows if there is more than 1 doctor
  const showNav = doctors.length > 1;

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % doctors.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + doctors.length) % doctors.length);
  };

  const currentDoctor = doctors[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <section className="w-full relative overflow-hidden bg-brand-600">
      {showNav && (
        <>
          <div className="absolute inset-y-0 left-0 z-20 flex items-center px-4">
            <button
              onClick={handlePrev}
              className="rounded-full bg-black/20 p-3 text-white backdrop-blur-md transition-colors hover:bg-black/40"
              aria-label="Previous Doctor"
            >
              <IconChevronLeft size={28} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 z-20 flex items-center px-4">
            <button
              onClick={handleNext}
              className="rounded-full bg-black/20 p-3 text-white backdrop-blur-md transition-colors hover:bg-black/40"
              aria-label="Next Doctor"
            >
              <IconChevronRight size={28} />
            </button>
          </div>
        </>
      )}

      <div className="grid">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="col-start-1 row-start-1 flex flex-col lg:flex-row w-full"
          >
          {/* Left Column - Bright Blue */}
          <div className="relative flex min-h-[400px] lg:min-h-[700px] items-end justify-center bg-brand-500 pt-12 lg:w-[45%] shrink-0 px-8">
            <Image
              src={currentDoctor.cutout_url || currentDoctor.image_url || "/dr-jeetendra.png"}
              alt={currentDoctor.name || "Doctor"}
              width={500}
              height={600}
              className="relative z-10 w-full h-full max-h-[700px] max-w-[340px] object-contain object-bottom drop-shadow-[0_20px_20px_rgba(0,0,0,0.4)]"
              style={{ marginBottom: "-1px" }}
            />
          </div>

          {/* Right Column - Dark Navy */}
          <div className="flex flex-col justify-center bg-brand-600 p-8 lg:w-[55%] lg:min-h-[700px] lg:p-16 text-white shrink-0 pl-16">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-8 bg-brand-400"></div>
              <span className="text-sm font-bold tracking-widest text-brand-400 uppercase">
                {currentDoctor.homepage_label || (currentDoctor.is_featured ? "Meet Founder" : "Meet Our Doctor")}
              </span>
            </div>
            
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
              {currentDoctor.name || "Doctor"}
            </h2>
            
            <p className="mb-6 text-lg font-semibold text-brand-200">
              {currentDoctor.education || currentDoctor.specialization || "Physiotherapist"}
            </p>
            
            <p className="mb-10 text-brand-100 leading-relaxed max-w-2xl">
              {currentDoctor.hero_bio || currentDoctor.bio || "Clinical Specialist Physiotherapist."}
            </p>
            
            <Link 
              href={`/doctors/${currentDoctor.slug}`} 
              className="inline-flex w-fit items-center font-bold text-teal-500 hover:text-teal-400 transition-colors uppercase tracking-widest text-sm"
            >
              More about {currentDoctor.name || "Doctor"} <span className="ml-2">→</span>
            </Link>
          </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
