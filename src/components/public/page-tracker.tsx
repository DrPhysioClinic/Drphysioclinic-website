"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logEvent } from "@/app/actions/analytics";

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    logEvent("pageview", pathname).catch(() => {});
  }, [pathname]);

  return null;
}
