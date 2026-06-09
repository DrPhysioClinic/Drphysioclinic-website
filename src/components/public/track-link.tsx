"use client";

import { logEvent } from "@/app/actions/analytics";
import type { ReactNode } from "react";

/**
 * Anchor that logs an analytics event on click before navigating.
 * Used for call / WhatsApp CTAs. Fire-and-forget; never blocks navigation.
 */
export function TrackLink({
  href,
  eventType,
  sourcePage,
  className,
  children,
  ariaLabel,
  external,
}: {
  href: string;
  eventType: string;
  sourcePage?: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => {
        void logEvent(eventType, sourcePage);
      }}
    >
      {children}
    </a>
  );
}
