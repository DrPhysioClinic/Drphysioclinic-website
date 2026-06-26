import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import {
  getServices,
  getDoctors,
  getUpdates,
  getVideos,
  getInfoPages,
} from "@/lib/queries";

export const revalidate = 3600;

/**
 * Dynamic sitemap: reads all published slugs from Supabase so new content
 * appears automatically on the next revalidation.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, doctors, updates, videos, infoPages] = await Promise.all([
    getServices(),
    getDoctors(),
    getUpdates(),
    getVideos(),
    getInfoPages(),
  ]);

  const staticRoutes = [
    "",
    "/about",
    "/doctors",
    "/treatments",
    "/updates",
    "/gallery",
    "/testimonials",
    "/contact",
    "/videos",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const dynamicRoutes = [
    ...services
      .filter((s) => s.slug)
      .map((s) => ({ url: `${SITE_URL}/treatments/${s.slug}`, lastModified: new Date(s.updated_at || new Date()) })),
    ...doctors
      .filter((d) => d.slug)
      .map((d) => ({ url: `${SITE_URL}/doctors/${d.slug}`, lastModified: new Date(d.updated_at || new Date()) })),
    ...updates
      .filter((u) => u.slug)
      .map((u) => ({
        url: `${SITE_URL}/updates/${u.slug}`,
        lastModified: new Date(u.updated_at || new Date()),
      })),
    ...infoPages
      .filter((p) => p.slug)
      .map((p) => ({ url: `${SITE_URL}/info/${p.slug}`, lastModified: new Date(p.updated_at || new Date()) })),
  ];

  // videos table has no detail route, but is referenced by the /videos page
  void videos;

  return [...staticRoutes, ...dynamicRoutes];
}
