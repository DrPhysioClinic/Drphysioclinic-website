"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import type { GalleryItem } from "@/types/database";

export function GalleryBrowser({ items }: { items: GalleryItem[] }) {
  const categories = Array.from(
    new Set(items.map((i) => i.category).filter((c): c is string => Boolean(c)))
  ).sort();
  const [active, setActive] = useState<string>("All");
  const filtered = active === "All" ? items : items.filter((i) => i.category === active);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setSelectedIndex(null), []);
  
  const goPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev === 0 ? filtered.length - 1 : prev - 1) : null));
  }, [filtered.length]);

  const goNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev !== null ? (prev === filtered.length - 1 ? 0 : prev + 1) : null));
  }, [filtered.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, closeLightbox, goPrev, goNext]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedIndex]);

  return (
    <div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActive(cat);
                setSelectedIndex(null);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active === cat
                  ? "bg-brand-600 text-white"
                  : "border border-slate-300 text-slate-600 hover:border-brand-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((g, idx) => (
          <figure 
            key={g.id} 
            className="group relative aspect-square overflow-hidden rounded-lg bg-brand-50 cursor-pointer"
            onClick={() => setSelectedIndex(idx)}
          >
            <Image
              src={g.image_url}
              alt={g.alt_text || g.title || "Gallery image"}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
               <span className="opacity-0 group-hover:opacity-100 bg-white/20 backdrop-blur-md text-white rounded-full p-2 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
               </span>
            </div>
            {g.title && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-2 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {g.title}
              </figcaption>
            )}
          </figure>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-slate-500">No photos in this category.</p>
        )}
      </div>

      {/* Lightbox Overlay */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
            onClick={closeLightbox}
          >
            <IconX size={28} />
          </button>
          
          <button 
            className="absolute left-4 z-10 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors hidden sm:block"
            onClick={goPrev}
          >
            <IconChevronLeft size={32} />
          </button>

          <div 
            className="relative flex flex-col md:flex-row w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo Section */}
            <div className="relative flex-1 min-h-[50vh] md:min-h-[70vh]">
              <Image
                src={filtered[selectedIndex].image_url}
                alt={filtered[selectedIndex].alt_text || filtered[selectedIndex].title || "Gallery image expanded"}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
              />
            </div>
            
            {/* Description Panel */}
            {(filtered[selectedIndex].title || filtered[selectedIndex].description) && (
              <div className="w-full md:w-[380px] shrink-0 p-6 md:p-8 flex flex-col justify-center overflow-y-auto">
                {filtered[selectedIndex].title && (
                  <h3 className="text-white text-2xl font-semibold tracking-tight mb-4">{filtered[selectedIndex].title}</h3>
                )}
                {filtered[selectedIndex].description && (
                  <p className="text-white/90 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{filtered[selectedIndex].description}</p>
                )}
              </div>
            )}
          </div>

          <button 
            className="absolute right-4 z-10 p-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors hidden sm:block"
            onClick={goNext}
          >
            <IconChevronRight size={32} />
          </button>
          
          {/* Mobile navigation area */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4 sm:hidden pointer-events-none">
             <button className="p-3 text-white bg-black/40 rounded-full pointer-events-auto backdrop-blur-md" onClick={goPrev}><IconChevronLeft size={24} /></button>
             <button className="p-3 text-white bg-black/40 rounded-full pointer-events-auto backdrop-blur-md" onClick={goNext}><IconChevronRight size={24} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
