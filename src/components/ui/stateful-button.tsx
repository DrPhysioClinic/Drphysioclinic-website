"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { motion, AnimatePresence, useAnimate } from "motion/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
  error?: boolean;
}

import { useFormStatus } from "react-dom";

export const Button = ({ className, children, error, ...props }: ButtonProps) => {
  const [scope, animate] = useAnimate();
  const { pending } = useFormStatus();
  const isMounted = React.useRef(false);
  const wasPending = React.useRef(false);
  const prevError = React.useRef(error);

  const animateLoading = async () => {
    await animate(
      ".loader",
      { width: "20px", scale: 1, display: "block" },
      { duration: 0.2 }
    );
  };

  const animateSuccess = async () => {
    await animate(
      ".loader",
      { width: "0px", scale: 0, display: "none" },
      { duration: 0.2 }
    );
    await animate(
      ".check",
      { width: "20px", scale: 1, display: "block" },
      { duration: 0.2 }
    );
    await animate(
      ".check",
      { width: "0px", scale: 0, display: "none" },
      { delay: 2, duration: 0.2 }
    );
  };

  const animateError = async () => {
    // Hide loader if it was showing
    await animate(".loader", { width: "0px", scale: 0, display: "none" }, { duration: 0.1 });
    // Jiggle animation (shake left and right)
    await animate(
      ".jiggle-wrapper",
      { x: [-10, 10, -8, 8, -5, 5, 0] },
      { duration: 0.5, ease: "easeInOut" }
    );
  };

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (pending && !wasPending.current) {
      animateLoading();
      wasPending.current = true;
    } else if (!pending && wasPending.current) {
      // It finished loading. Did it result in an error?
      if (error) {
        animateError();
      } else {
        animateSuccess();
      }
      wasPending.current = false;
    }
  }, [pending, error, animate]);

  // Handle case where error is set without a transition (e.g. initial form load with error, though rare)
  React.useEffect(() => {
    if (isMounted.current && !pending && error && !prevError.current) {
      animateError();
    }
    prevError.current = error;
  }, [error, pending, animate]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      await animateLoading();
      await props.onClick(event);
      await animateSuccess();
    }
  };

  const {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    ...buttonProps
  } = props;

  return (
    <motion.button
      layout
      ref={scope}
      className={cn(
        "btn-primary flex min-w-[120px] cursor-pointer items-center justify-center gap-2 transition-colors duration-200",
        className,
      )}
      {...buttonProps}
      onClick={handleClick}
    >
      <div className="jiggle-wrapper flex items-center justify-center">
        <motion.div layout className="flex items-center gap-2">
          <Loader />
          <CheckIcon />
          <motion.span layout>{children}</motion.span>
        </motion.div>
      </div>
    </motion.button>
  );
};

const Loader = () => {
  return (
    <motion.svg
      animate={{
        rotate: [0, 360],
      }}
      initial={{
        scale: 0,
        width: 0,
        display: "none",
      }}
      style={{
        scale: 0.5,
        display: "none",
      }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
        ease: "linear",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="loader text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 3a9 9 0 1 0 9 9" />
    </motion.svg>
  );
};

const CheckIcon = () => {
  return (
    <motion.svg
      initial={{
        scale: 0,
        width: 0,
        display: "none",
      }}
      style={{
        scale: 0.5,
        display: "none",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="check text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M9 12l2 2l4 -4" />
    </motion.svg>
  );
};
