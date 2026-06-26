import { SITE_URL } from "@/lib/constants";
import type { Doctor, Service, Update, Condition, Area } from "@/types/database";

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
    ...(doctor.education || doctor.registration_no
      ? {
          hasCredential: [
            ...(doctor.education ? [{ "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: doctor.education }] : []),
            ...(doctor.registration_no ? [{ "@type": "EducationalOccupationalCredential", credentialCategory: "registration", name: doctor.registration_no }] : []),
          ],
        }
      : {}),
    ...(doctor.memberships
      ? { memberOf: { "@type": "Organization", name: doctor.memberships } }
      : {}),
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

/** schema.org MedicalProcedure + Service for condition pages. */
export function conditionJsonLd(condition: Condition, clinicName: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalProcedure", "Service"],
    name: condition.title,
    description: condition.seo_description || condition.title || undefined,
    url: `${SITE_URL}/conditions/${condition.slug}`,
    provider: { "@type": "MedicalClinic", name: clinicName },
    areaServed: { "@type": "Place", name: "Ahmedabad" },
  };
}

/** schema.org FAQPage for condition pages. */
export function faqPageJsonLd(condition: Condition) {
  const isValid = (text: string | null) => text && !text.includes("[PLACEHOLDER]");
  const mainEntity = [];

  if (isValid(condition.symptoms)) {
    mainEntity.push({
      "@type": "Question",
      name: "What are the common symptoms?",
      acceptedAnswer: {
        "@type": "Answer",
        text: condition.symptoms,
      },
    });
  }

  if (isValid(condition.treatment)) {
    mainEntity.push({
      "@type": "Question",
      name: "How do we treat this condition?",
      acceptedAnswer: {
        "@type": "Answer",
        text: condition.treatment,
      },
    });
  }

  if (isValid(condition.when_to_see)) {
    mainEntity.push({
      "@type": "Question",
      name: "When should you see a physiotherapist?",
      acceptedAnswer: {
        "@type": "Answer",
        text: condition.when_to_see,
      },
    });
  }

  if (mainEntity.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

/** schema.org Service/LocalBusiness reference for area pages. */
export function areaJsonLd(area: Area, clinicName: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["Service", "LocalBusiness"],
    name: `${clinicName} - ${area.title}`,
    description: area.seo_description || area.title || undefined,
    url: `${SITE_URL}/areas/${area.slug}`,
    provider: { "@type": "MedicalClinic", name: clinicName },
    areaServed: { "@type": "Place", name: area.title },
  };
}

/** schema.org BreadcrumbList for nested pages. */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
