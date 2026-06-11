"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "motion/react";

export function InputGlow({ children, className }: { children: React.ReactNode; className?: string }) {
  const radius = 90; 
  const [visible, setVisible] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
            #17153f,
            transparent 100%
          ),
          ${focused ? "#17153f" : "#cbd5e1"}
        `,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={cn(
        "group/input rounded-xl transition duration-300 overflow-hidden p-[2px]",
        className
      )}
    >
      {React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(
          (children as React.ReactElement<{ className?: string }>).props.className,
          "!border-none !ring-0 w-full outline-none bg-white"
        )
      })}
    </motion.div>
  );
}
