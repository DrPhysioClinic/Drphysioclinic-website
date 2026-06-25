"use client"

import React, { type ComponentPropsWithoutRef } from "react"
import { motion, Transition, Variants } from "framer-motion"

import { cn } from "@/lib/utils"

interface SpinningTextProps extends ComponentPropsWithoutRef<"div"> {
  children: string | string[]
  duration?: number
  reverse?: boolean
  radius?: number
  transition?: Transition
  variants?: {
    container?: Variants
    item?: Variants
  }
}

const BASE_TRANSITION: Transition = {
  repeat: Infinity,
  ease: "linear",
}

const BASE_ITEM_VARIANTS: Variants = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
  },
}

export function SpinningText({
  children,
  duration = 10,
  reverse = false,
  radius = 5,
  transition,
  variants,
  className,
  style,
}: SpinningTextProps) {
  if (typeof children !== "string" && !Array.isArray(children)) {
    throw new Error("children must be a string or an array of strings")
  }

  let textChildren = children;
  if (Array.isArray(textChildren)) {
    if (!textChildren.every((child) => typeof child === "string")) {
      throw new Error("all elements in children array must be strings")
    }
    textChildren = textChildren.join("")
  }

  const letters = (textChildren as string).split("")
  letters.push(" ")

  const finalTransition: Transition = {
    ...BASE_TRANSITION,
    ...transition,
    duration: (transition as { duration?: number })?.duration ?? duration,
  }

  const containerVariants: Variants = {
    visible: { rotate: reverse ? -360 : 360 },
    ...variants?.container,
  }

  const itemVariants: Variants = {
    ...BASE_ITEM_VARIANTS,
    ...variants?.item,
  }

  return (
    <motion.div
      className={cn("relative perspective-1000", className)}
      style={{
        ...style,
        transformStyle: "preserve-3d",
      }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={finalTransition}
    >
      <style>{`
        @keyframes spinning-text-blur {
          0% { filter: blur(0px); opacity: 1; }
          25% { filter: blur(0px); opacity: 1; }
          50% { filter: blur(4px); opacity: 0.3; }
          75% { filter: blur(0px); opacity: 1; }
          100% { filter: blur(0px); opacity: 1; }
        }
      `}</style>
      {letters.map((letter, index) => (
        <motion.span
          aria-hidden="true"
          key={`${index}-${letter}`}
          variants={itemVariants}
          className="absolute top-1/2 left-1/2 inline-block font-semibold"
          style={
            {
              "--index": index,
              "--total": letters.length,
              "--radius": radius,
              transform: `
                  translate(-50%, -50%)
                  rotate(calc(360deg / var(--total) * var(--index)))
                  translateY(calc(var(--radius, 5) * -1ch))
                `,
              transformOrigin: "center",
            } as React.CSSProperties
          }
        >
          {letter}
        </motion.span>
      ))}
      <span className="sr-only">{textChildren}</span>
    </motion.div>
  )
}
