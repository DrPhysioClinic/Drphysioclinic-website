"use client";

import { motion } from "motion/react";
import { ElementType } from "react";

export function AnimatedTitle({
  text,
  className = "",
  as: Component = "h2",
}: {
  text: string;
  className?: string;
  as?: ElementType;
}) {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(8px)",
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
      },
    },
  };

  const MotionComponent = motion(Component as any);

  return (
    <MotionComponent
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {words.map((word, index) => (
        <motion.span variants={child} key={index} className="inline-block whitespace-pre">
          {word}{index !== words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </MotionComponent>
  );
}
