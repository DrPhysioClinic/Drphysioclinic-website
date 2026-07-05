import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // This project has its own lockfile; pin the tracing root to avoid Next.js
  // picking up an unrelated lockfile in a parent directory.
  outputFileTracingRoot: __dirname,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Supabase Storage public bucket URLs
      { protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Placeholder images used during the skeleton phase
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  async redirects() {
    return [
      // --- TIER 1: SPECIFIC HIGH-VALUE MAPPINGS ---
      // These map to specific new pages for maximum authority transfer.
      { source: '/treatment/best-knee-pain-physiotherapy-doctors/14', destination: '/treatments/knee-pain-treatment', permanent: true },
      { source: '/latest-update/best-knee-pain-physiotherapy-doctors-in-ahmedabad/28', destination: '/treatments/knee-pain-treatment', permanent: true },
      { source: '/latest-update/best-way-to-try-knee-physiotherapy-in-ahmedabad-w/26', destination: '/treatments/knee-pain-treatment', permanent: true },
      { source: '/latest-update/try-knee-physiotherapy-who-want-to-avoid-knee-su/6', destination: '/treatments/knee-pain-treatment', permanent: true },
      { source: '/treatment/cupping-therapy/2', destination: '/treatments/cupping-therapy', permanent: true },
      { source: '/treatment/top-old-age-physiotherapy-senior-citizens/5', destination: '/treatments/old-age-physiotherapy', permanent: true },
      { source: '/treatment/special-offer-for-senior-citizen/11', destination: '/treatments/old-age-physiotherapy', permanent: true },
      { source: '/treatment/ahmedabad-top-sports-physiotherapy-clinic/7', destination: '/treatments/ortho-sports-injury-physiotherapy', permanent: true },
      { source: '/treatment/dr-physio-ahmedabad-s-best-ortho-and-sports-inju/20', destination: '/treatments/ortho-sports-injury-physiotherapy', permanent: true },
      { source: '/treatment/ahmedabad-s-top-ortho-and-sports-physiotherapist-d/10', destination: '/treatments/ortho-sports-injury-physiotherapy', permanent: true },
      { source: '/treatment/ortho-physio/8', destination: '/treatments/ortho-sports-injury-physiotherapy', permanent: true },
      { source: '/latest-update/best-doctors-for-sports-injury-treatment-in-ahmeda/40', destination: '/treatments/ortho-sports-injury-physiotherapy', permanent: true },
      { source: '/latest-update/best-sports-physiotherapy-doctors-in-ahmedabad-d/42', destination: '/treatments/ortho-sports-injury-physiotherapy', permanent: true },
      { source: '/all-treatment/7', destination: '/treatments', permanent: true },

      // --- TIER 2: WILDCARD FAMILY CATCH-ALLS ---
      // These catch any remaining URLs not matched by Tier 1.
      { source: '/treatment/tag/:slug*', destination: '/treatments', permanent: true },
      { source: '/treatment/category/:slug*', destination: '/treatments', permanent: true },
      { source: '/treatment/:slug*', destination: '/treatments', permanent: true },
      { source: '/latest-update/:slug*', destination: '/updates', permanent: true },
      { source: '/latest-updates/:slug*', destination: '/updates', permanent: true },
      { source: '/all-treatment/:slug*', destination: '/treatments', permanent: true },
      { source: '/page/:slug*', destination: '/', permanent: true },
      { source: '/pages/:slug*', destination: '/', permanent: true },
      { source: '/image-gallery/:slug*', destination: '/gallery', permanent: true },
      { source: '/our-doctors', destination: '/doctors', permanent: true },
      { source: '/mapview/:slug*', destination: '/contact', permanent: true },
    ];
  },
};

export default nextConfig;
