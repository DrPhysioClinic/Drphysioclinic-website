"use client";

import { useEffect, useRef } from "react";
import { heroState } from "@/lib/hero-state";

export function HeroVisibilityTracker() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the hero section is intersecting, it is in view
        heroState.setInView(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0, // Trigger as soon as the hero leaves/enters the viewport at all
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Position it right at the top of the button container so it triggers when the button scrolls out
  return <div ref={ref} className="absolute -top-1 left-0 w-full h-[1px] pointer-events-none" aria-hidden="true" />;
}
