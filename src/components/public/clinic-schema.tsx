import { getResolvedSettings, getSocialLinks } from "@/lib/queries";
import { SITE_URL } from "@/lib/constants";

export async function ClinicSchema() {
  const settings = await getResolvedSettings();
  const socialLinks = await getSocialLinks();

  const sameAs = [
    settings.google_maps_url,
    ...socialLinks.map((s) => s.url),
  ].filter(Boolean);

  const schema = {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "Physiotherapy"],
    name: settings.clinic_name,
    url: SITE_URL,
    logo: settings.logo_url || `${SITE_URL}/dr-physio-logo-03.png`,
    image: `${SITE_URL}/dr-jeetendra.png`,
    telephone: settings.phone_primary,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      postalCode: "380058",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.latitude,
      longitude: settings.longitude,
    },
    hasMap: "ChIJwSvybs-bXjkRNWGvJbAjZ4g",
    areaServed: ["Bopal", "South Bopal", "Ghuma", "Shela", "Ambli", "Ahmedabad"],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "593",
    },
    priceRange: "₹₹",
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
