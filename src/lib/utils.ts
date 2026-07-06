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
  // Split path from query string
  const [pathname, search] = path.split("?");
  let cleanPath = pathname;
  
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
  
  // Preserve only the 'page' query parameter
  let queryString = "";
  if (search) {
    const params = new URLSearchParams(search);
    const page = params.get("page");
    // Ensure we don't duplicate ?page=1
    if (page && page !== "1") {
      queryString = `?page=${page}`;
    }
  }
  
  // Return absolute URL
  return `${cleanSiteUrl}${cleanPath === "/" ? "" : cleanPath}${queryString}`;
}
