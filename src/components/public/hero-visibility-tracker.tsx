"use client";

import { useEffect, useRef } from "react";
import { heroState } from "@/lib/hero-state";

export function HeroVisibilityTracker() {
  useEffect(() => {
    const handleScroll = () => {
      // If we haven't scrolled past 35% of the viewport height, the hero is still "in view"
      const inView = window.scrollY < window.innerHeight * 0.35;
      heroState.setInView(inView);
    };

    // Check immediately on mount
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}
