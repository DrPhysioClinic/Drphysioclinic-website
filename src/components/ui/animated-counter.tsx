"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
  locale?: string;
}

export function AnimatedCounter({ value, suffix = "", decimals = 0, locale = "en-IN" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (inView) {
      animate(motionValue, value, { duration: 2.5, ease: "easeOut" });
    }
  }, [inView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent =
          Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }).format(Number(latest)) + suffix;
      }
    });
    return () => unsubscribe();
  }, [motionValue, decimals, suffix, locale]);

  return <span ref={ref}>0{suffix}</span>;
}
