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
      { protocol: "https", hostname: supabaseHost },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
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
      { source: '/updates/say-goodbye-to-hi', destination: '/updates/say-goodbye-to-hip-pain', permanent: true },
      { source: '/updates/physiotherapy-is-ess', destination: '/updates/physiotherapy-is-essential', permanent: true },
      { source: '/updates/transform-your-fi', destination: '/updates/transform-your-fitness-story', permanent: true },
      { source: '/updates/dushyant-bhai-rec', destination: '/updates/dushyant-bhai-recovered', permanent: true },
      { source: '/updates/say-goodbye-to-hip-pain-welcome-to-dr-physio-p', destination: '/updates/say-goodbye-to-hip-pain', permanent: true },
      { source: '/updates/dr-physio-affordable-home-visit-physiotherap', destination: '/updates/dr-physio-affordable-home-visit-physiotherapy', permanent: true },
      { source: '/updates/dr-physio-best-physiotherapy-rehab-center-i', destination: '/updates/dr-physio-best-physiotherapy-rehab-center', permanent: true },
      { source: '/updates/say-goodbye-to-back-pain-get-back-to-living-yo', destination: '/updates/say-goodbye-to-back-pain-get-back-to-living-you', permanent: true },
      { source: '/updates/battling-chronic-neck-pain-it-s-time-to-take-a', destination: '/updates/battling-chronic-neck-pain-it-s-time-to-take-ac', permanent: true },
      { source: '/updates/you-re-in-your-40s-and-it-s-the-perfect-time-t', destination: '/updates/never-too-late-to-start-in-your-40s', permanent: true },
      { source: '/updates/s-never-too-late-to-start-ready-to-feel-bett', destination: '/updates/never-too-late-to-start-in-your-40s', permanent: true },
      { source: '/updates/dushyant-bhai-recovered-from-severe-neck-pain', destination: '/updates/dushyant-bhai-recovered', permanent: true },
      
      // Old Boost360 specific mappings
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy-Report-Only", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://vercel.live; frame-src 'self' https://www.youtube.com; img-src 'self' data: https:; connect-src 'self' https:;" }
        ]
      }
    ];
  },
};

export default nextConfig;
