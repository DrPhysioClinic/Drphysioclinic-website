"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({ value, suffix = "", decimals = 0 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (inView) {
      animate(motionValue, value, { duration: 2, ease: "easeOut" });
    }
  }, [inView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent =
          Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(Number(latest)) + suffix;
      }
    });
    return () => unsubscribe();
  }, [motionValue, decimals, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}
