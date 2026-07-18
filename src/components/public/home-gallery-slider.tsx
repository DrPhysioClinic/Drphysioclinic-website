"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { Database } from "@/types/database";

type GalleryItem = Database["public"]["Tables"]["gallery"]["Row"];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export function HomeGallerySlider({ gallery }: { gallery: GalleryItem[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(gallery.length / itemsPerPage);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (totalPages <= 1) return;
    
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 8000); // Rotate every 8 seconds
    
    return () => clearInterval(interval);
  }, [totalPages, currentPage]);

  if (gallery.length === 0) return null;

  const currentItems = gallery.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageClick = (i: number) => {
    if (i === currentPage) return;
    setDirection(i > currentPage ? 1 : -1);
    setCurrentPage(i);
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    if (offset.x < -50 || velocity.x < -500) {
      handlePageClick((currentPage + 1) % totalPages);
    } else if (offset.x > 50 || velocity.x > 500) {
      handlePageClick(currentPage === 0 ? totalPages - 1 : currentPage - 1);
    }
  };

  return (
    <div className="relative w-full overflow-hidden pb-4">
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={currentPage}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          drag={isMobile ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className={`grid grid-cols-2 gap-4 md:grid-cols-4 w-full ${isMobile ? 'cursor-grab active:cursor-grabbing touch-pan-y' : ''}`}
        >
          {currentItems.map((g) => (
            <div key={g.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={g.image_url}
                alt={g.alt_text || g.title || "Gallery image"}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
                unoptimized
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
      
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageClick(i)}
              className={`h-2.5 w-2.5 cursor-pointer rounded-full transition-colors ${
                i === currentPage ? "bg-brand-600 scale-125" : "bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
