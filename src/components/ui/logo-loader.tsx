"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function LogoLoader() {
  const [phase, setPhase] = useState<"tracing" | "revealing" | "unmounted">("tracing");

  useEffect(() => {
    // 0 -> 2500ms: Tracing animation runs (controlled by Framer Motion)
    
    // Switch to revealing phase at 2500ms
    const revealTimer = setTimeout(() => {
      setPhase("revealing");
    }, 2500);

    // Unmount completely after reveal is done
    const unmountTimer = setTimeout(() => {
      setPhase("unmounted");
    }, 3500); // 1000ms for reveal animation

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  // Paths from Dr physio logo-11.svg
  const path1 = "M683.2,793.6c.2,2.8.3,5.7.3,8.6v196.7h-287v-266.9h48.9v228.6h189.5v-10.6h-.1v-152.2c-2.3-45.4-40-81.7-86-81.7h-225v.3H110.9v-304.5h378c10.3,0,20.7,1.4,30.6,4.3,117.1,34.2,164.1,146.8,164.1,146.8h-24.4c-63.5-77.4-113.9-78.1-113.9-78.1l-51.8-2.3c3.8,15,36.8,16.5,36.8,16.5,58.6,7.5,51.8,44.3,51.8,44.3,0,0-23.3-4.5-100.7-15-57.1-7.7-90.5-47.4-104.1-67.6h-217.6v206.9h389c71.4,0,130,55.8,134.4,126.1";
  const path2 = "M396.8,286.4c-.2-2.8-.3-5.7-.3-8.6V81.2h287v266.9h-48.9V119.4h-189.5v10.6h.1v152.2c2.3,45.4,40,81.7,86,81.7h225v-.3h212.9v304.5h-378c-10.3,0-20.7-1.4-30.6-4.3-117.1-34.2-163.2-142.8-163.2-142.8h24.4c63.5,77.4,113,74.2,113,74.2l51.8,2.3c-3.8-15-36.8-16.5-36.8-16.5-58.6-7.5-51.8-44.3-51.8-44.3,0,0,23.3,4.5,100.7,15,57.1,7.7,90.5,47.4,104.1,67.6h217.6v-206.9h-389c-71.4,0-130-55.8-134.4-126.1";

  // Using brand-500 for the final fill color
  const fillColor = "var(--color-brand-500, #2b2775)";

  return (
    <AnimatePresence>
      {phase !== "unmounted" && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-slate-950 pointer-events-none"
          initial={{ clipPath: "circle(150% at 50% 50%)" }}
          animate={
            phase === "revealing"
              ? { clipPath: "circle(0% at 50% 50%)", opacity: 0 }
              : { clipPath: "circle(150% at 50% 50%)", opacity: 1 }
          }
          transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
          exit={{ opacity: 0 }}
        >
          <div className="relative w-48 h-48 md:w-64 md:h-64">
            <svg
              viewBox="0 0 1080 1080"
              className="w-full h-full drop-shadow-xl"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* First path */}
              <motion.path
                d={path1}
                stroke={fillColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, fill: "rgba(0,0,0,0)" }}
                animate={{ pathLength: 1, fill: fillColor }}
                transition={{
                  pathLength: { duration: 1.5, ease: "easeInOut", delay: 0 },
                  fill: { duration: 0.5, ease: "easeIn", delay: 1.5 }
                }}
              />
              
              {/* Second path */}
              <motion.path
                d={path2}
                stroke={fillColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, fill: "rgba(0,0,0,0)" }}
                animate={{ pathLength: 1, fill: fillColor }}
                transition={{
                  pathLength: { duration: 1.5, ease: "easeInOut", delay: 0.2 },
                  fill: { duration: 0.5, ease: "easeIn", delay: 1.7 }
                }}
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
