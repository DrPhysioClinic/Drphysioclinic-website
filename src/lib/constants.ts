export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.drphysioclinic.com";

/** Fallbacks used only if the settings row can't be read (free tier paused, etc.). */
export const CLINIC_FALLBACK = {
  clinic_name: "Dr Physio – Ortho & Sports Injury Clinic",
  tagline:
    "Physiotherapy, Sports Injury Clinic, Fitness Studio & Child Development Center",
  phone_primary: "+91 7874837101",
  phone_secondary: "+91 8048039022",
  whatsapp_number: "+91 7874837101",
  email: "drphysioahmedabad@gmail.com",
  address:
    "5, 2nd Floor, Amrapali Axiom Complex, Above Sankalp Restaurant, Bopal, Ahmedabad-380058 Gujarat",
  latitude: 23.028059387527982,
  longitude: 72.4886988075104,
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/doctors", label: "Doctors" },
  { href: "/treatments", label: "Treatments" },
  { href: "/updates", label: "Updates" },
  { href: "/gallery", label: "Gallery" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
] as const;

export const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/doctors", label: "Doctors" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/updates", label: "Updates" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/info-pages", label: "Info Pages" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export const PAYMENT_MODES = ["Cash", "UPI", "Card"] as const;
export const LEAD_STATUSES = ["new", "contacted", "closed"] as const;

/** ISR revalidation window for public pages (1 hour). */
export const PUBLIC_REVALIDATE = 3600;

export const STORAGE_BUCKET = "media";

/** Build a tel: / wa.me href from a possibly spaced phone string. */
export function telHref(phone?: string | null) {
  return `tel:${(phone || "").replace(/\s+/g, "")}`;
}
export function whatsappHref(phone?: string | null, text?: string) {
  const digits = (phone || "").replace(/[^\d]/g, "");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${q}`;
}
