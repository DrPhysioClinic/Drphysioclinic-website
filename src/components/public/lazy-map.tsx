"use client";

import { useState, useEffect, useRef } from "react";
import { IconMapPin } from "@tabler/icons-react";

export function LazyMap({
  latitude,
  longitude,
  title = "Clinic location",
}: {
  latitude: number;
  longitude: number;
  title?: string;
}) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" } // Start loading when 600px away from viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-slate-100 flex items-center justify-center overflow-hidden">
      {/* Loading Skeleton / Placeholder */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-10 transition-opacity duration-700"
        style={{ opacity: isReady ? 0 : 1, pointerEvents: isReady ? "none" : "auto" }}
      >
        <div className="animate-pulse flex flex-col items-center">
          <IconMapPin className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-sm font-medium text-slate-400">Loading map...</p>
        </div>
      </div>

      {shouldLoad && (
        <iframe
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
          onLoad={() => setIsReady(true)}
          style={{ opacity: isReady ? 1 : 0, transition: "opacity 0.7s ease-in-out" }}
        />
      )}
    </div>
  );
}
