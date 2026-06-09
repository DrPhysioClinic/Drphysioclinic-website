import { SITE_URL } from "@/lib/constants";
import type { Doctor, Service, Update } from "@/types/database";

type ResolvedSettings = {
  clinic_name: string;
  tagline: string;
  phone_primary: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
};

/** schema.org MedicalClinic (with Physiotherapy) for the business. */
export function clinicJsonLd(s: ResolvedSettings, logoUrl?: string | null) {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "Physiotherapy"],
    name: s.clinic_name,
    description: s.tagline,
    url: SITE_URL,
    telephone: s.phone_primary,
    email: s.email,
    image: logoUrl || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address,
      addressLocality: "Bopal, Ahmedabad",
      addressRegion: "Gujarat",
      postalCode: "380058",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: s.latitude,
      longitude: s.longitude,
    },
    areaServed: [
      { "@type": "Place", name: "Bopal" },
      { "@type": "Place", name: "Ahmedabad" },
    ],
    medicalSpecialty: "Physiotherapy",
  };
}

/** schema.org Physician for doctor pages. */
export function physicianJsonLd(doctor: Doctor, clinicName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    description: doctor.bio || doctor.specialization || undefined,
    medicalSpecialty: doctor.specialization || "Physiotherapy",
    image: doctor.image_url || undefined,
    url: `${SITE_URL}/doctors/${doctor.slug}`,
    worksFor: { "@type": "MedicalClinic", name: clinicName },
  };
}

/** schema.org MedicalProcedure + Service for treatment pages. */
export function treatmentJsonLd(service: Service, clinicName: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalProcedure", "Service"],
    name: service.title,
    description: service.short_description || service.full_description || undefined,
    url: `${SITE_URL}/treatments/${service.slug}`,
    category: service.category || undefined,
    image: service.hero_image_url || undefined,
    provider: { "@type": "MedicalClinic", name: clinicName },
    ...(service.price != null
      ? {
          offers: {
            "@type": "Offer",
            price: service.price,
            priceCurrency: "INR",
          },
        }
      : {}),
  };
}

/** schema.org BlogPosting for updates. */
export function updateJsonLd(update: Update, clinicName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: update.title,
    description: update.excerpt || undefined,
    image: update.image_url || undefined,
    datePublished: update.published_at || update.created_at,
    dateModified: update.updated_at,
    url: `${SITE_URL}/updates/${update.slug}`,
    publisher: { "@type": "Organization", name: clinicName },
  };
}
