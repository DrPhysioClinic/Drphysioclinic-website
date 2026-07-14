import type { Metadata } from "next";
import { Outfit, Playfair_Display, Bitter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { getResolvedSettings } from "@/lib/queries";
import { SITE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const bitter = Bitter({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  variable: "--font-instrument",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getResolvedSettings();
  const title = s.seo_title || s.clinic_name;
  const description = s.seo_description || s.tagline;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | Dr Physio`,
    },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: SITE_URL,
      siteName: s.clinic_name,
    },
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: s.favicon_url || '/favicon.svg' },
      ],
    },
  };
}

import { LogoLoader } from "@/components/ui/logo-loader";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", bitter.variable)}>
      <body className={`${bitter.variable} ${playfair.variable} ${instrumentSerif.variable} antialiased`}>
        {children}
        <LogoLoader />
      </body>
    </html>
  );
}
