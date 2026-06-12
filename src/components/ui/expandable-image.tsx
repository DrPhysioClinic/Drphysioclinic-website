"use client";

import { useState } from "react";
import Image from "next/image";
import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";

interface ExpandableImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ExpandableImage({ src, alt, className = "", priority = false }: ExpandableImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className={`cursor-pointer ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 100vw"
          quality={100}
          className="object-cover transition-transform duration-300 hover:scale-105"
          priority={priority}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <button 
              className="absolute right-6 top-6 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <IconX size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative h-full max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                fill
                quality={100}
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
