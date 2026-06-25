import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SITE_URL } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function parseTime(timeStr: string | null) { if (!timeStr) return null; return timeStr; }

/** 
 * Returns a clean, self-referencing canonical URL.
 * Drops query params and trailing slashes.
 */
export function getCanonicalUrl(path: string) {
  // Strip query params if they somehow got passed (usually we just pass pathname)
  let cleanPath = path.split("?")[0];
  // Strip trailing slash unless it's just "/"
  if (cleanPath !== "/" && cleanPath.endsWith("/")) {
    cleanPath = cleanPath.slice(0, -1);
  }
  // If no path is provided, default to root
  if (!cleanPath) cleanPath = "/";
  
  // Ensure SITE_URL itself doesn't have a trailing slash
  const cleanSiteUrl = SITE_URL.endsWith("/") ? SITE_URL.slice(0, -1) : SITE_URL;
  
  // Ensure path starts with /
  if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
  
  // Return absolute URL
  return `${cleanSiteUrl}${cleanPath === "/" ? "" : cleanPath}`;
}
