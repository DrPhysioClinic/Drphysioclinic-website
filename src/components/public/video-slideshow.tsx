"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { Video } from "@/types/database";

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

export function VideoSlideshow({ videos }: { videos: Video[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const visibleItems = isMobile ? 1 : 3;
  const maxIndex = Math.max(0, videos.length - visibleItems);

  const handleNext = () => {
    if (currentIndex >= maxIndex) {
      // Optional wrap around, but for tile-by-tile, hard stop or wrap is fine. Let's wrap.
      setDirection(1);
      setCurrentIndex(0);
    } else {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
    setPlayingVideoId(null);
  };

  const handlePrev = () => {
    if (currentIndex <= 0) {
      setDirection(-1);
      setCurrentIndex(maxIndex);
    } else {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
    setPlayingVideoId(null);
  };

  const handlePageClick = (i: number) => {
    if (i === currentIndex) return;
    setDirection(i > currentIndex ? 1 : -1);
    setCurrentIndex(i);
    setPlayingVideoId(null);
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    if (offset.x < -50 || velocity.x < -500) {
      handleNext();
    } else if (offset.x > 50 || velocity.x > 500) {
      handlePrev();
    }
  };

  if (!videos || videos.length === 0) return null;

  const currentItems = videos.slice(currentIndex, currentIndex + visibleItems);

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return undefined;
    const cleanUrl = url.trim();

    // 1. Check if they just pasted a raw 11-character YouTube ID
    if (cleanUrl.length === 11 && !cleanUrl.includes(' ') && !cleanUrl.includes('/') && !cleanUrl.includes('.')) {
      return `https://www.youtube.com/embed/${cleanUrl}?autoplay=1&rel=0`;
    }

    // 2. Standard robust regex for all YouTube link variations
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = cleanUrl.match(regExp);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
    
    // 3. Fallback: If it's a generic link, return it. If it's just missing https://, prepend it.
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    if (cleanUrl.includes('.')) {
      return `https://${cleanUrl}`;
    }

    return undefined;
  };

  return (
    <div className="relative w-full overflow-hidden pb-4">
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
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
          className={`grid grid-cols-1 gap-6 md:grid-cols-3 w-full ${isMobile ? 'cursor-grab active:cursor-grabbing touch-pan-y' : ''}`}
        >
          {currentItems.map((video) => {
            const isPlaying = playingVideoId === video.id;
            const embedUrl = getYoutubeEmbedUrl(video.video_url);
            return (
              <div key={video.id} className="relative aspect-video overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-200">
                {isPlaying ? (
                  embedUrl ? (
                    <iframe 
                      src={embedUrl} 
                      className="absolute inset-0 h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen 
                    />
                  ) : (
                    <div className="flex flex-col h-full w-full items-center justify-center bg-slate-200 text-slate-500 p-4 text-center">
                      <p>Cannot play this video URL.</p>
                      <p className="text-xs mt-2 break-all text-slate-400 font-mono">{video.video_url}</p>
                    </div>
                  )
                ) : (
                  <div className="group absolute inset-0 cursor-pointer" onClick={() => setPlayingVideoId(video.id)}>
                    {video.thumbnail_url ? (
                      <Image
                        src={video.thumbnail_url}
                        alt={video.title || "Video thumbnail"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-200">
                        <span className="text-slate-400 font-medium">No thumbnail</span>
                      </div>
                    )}
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/10">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform group-hover:scale-110">
                        <svg className="ml-1 h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {maxIndex > 0 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageClick(i)}
              className={`h-2.5 w-8 rounded-full transition-colors ${
                i === currentIndex ? "bg-brand-500" : "bg-slate-200 hover:bg-slate-300"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
