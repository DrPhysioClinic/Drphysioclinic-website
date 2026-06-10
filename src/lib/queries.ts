import { createPublicClient } from "@/lib/supabase/public";
import { CLINIC_FALLBACK } from "@/lib/constants";
import type {
  Doctor,
  Service,
  Testimonial,
  GalleryItem,
  Update,
  Video,
  InfoPage,
  Settings,
  SocialLink,
} from "@/types/database";

/**
 * Public read layer. Every function uses the anon client, so RLS returns only
 * published rows. These run at build / ISR time, never per public request.
 * All functions degrade gracefully (return null / []) if Supabase is paused.
 */

export async function getSettings(): Promise<Settings | null> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

/** Merge the DB settings row with safe fallbacks so the UI always has values. */
export async function getResolvedSettings() {
  const settings = await getSettings();
  return {
    clinic_name: settings?.clinic_name ?? CLINIC_FALLBACK.clinic_name,
    tagline: settings?.tagline ?? CLINIC_FALLBACK.tagline,
    phone_primary: settings?.phone_primary ?? CLINIC_FALLBACK.phone_primary,
    phone_secondary: settings?.phone_secondary ?? CLINIC_FALLBACK.phone_secondary,
    whatsapp_number: settings?.whatsapp_number ?? CLINIC_FALLBACK.whatsapp_number,
    email: settings?.email ?? CLINIC_FALLBACK.email,
    address: settings?.address ?? CLINIC_FALLBACK.address,
    google_maps_url: settings?.google_maps_url ?? null,
    latitude: settings?.latitude ?? CLINIC_FALLBACK.latitude,
    longitude: settings?.longitude ?? CLINIC_FALLBACK.longitude,
    opening_hours: settings?.opening_hours ?? null,
    logo_url: settings?.logo_url ?? null,
    seo_title: settings?.seo_title ?? null,
    seo_description: settings?.seo_description ?? null,
  };
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("social_links")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

// ---------- Doctors ----------
export async function getDoctors(featuredOnly = false): Promise<Doctor[]> {
  try {
    const supabase = createPublicClient();
    let q = supabase
      .from("doctors")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (featuredOnly) q = q.eq("is_featured", true);
    const { data } = await q;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getDoctorBySlug(slug: string): Promise<Doctor | null> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("doctors")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

// ---------- Services ----------
export async function getServices(): Promise<Service[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("is_published", true)
      .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
      .order("sort_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getFeaturedServices(limit = 6): Promise<Service[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("is_published", true)
      .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .limit(limit);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getServiceCategories(): Promise<string[]> {
  const services = await getServices();
  return Array.from(
    new Set(services.map((s) => s.category).filter((c): c is string => Boolean(c)))
  ).sort();
}

// ---------- Testimonials ----------
export async function getTestimonials(featuredOnly = false): Promise<Testimonial[]> {
  try {
    const supabase = createPublicClient();
    let q = supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (featuredOnly) q = q.eq("is_featured", true);
    const { data } = await q;
    return data ?? [];
  } catch {
    return [];
  }
}

// ---------- Gallery ----------
export async function getGallery(): Promise<GalleryItem[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("gallery")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

// ---------- Updates ----------
export async function getUpdates(): Promise<Update[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("updates")
      .select("*")
      .eq("is_published", true)
      .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
      .order("published_at", { ascending: false, nullsFirst: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getUpdateBySlug(slug: string): Promise<Update | null> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("updates")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

// ---------- Videos ----------
export async function getVideos(): Promise<Video[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

// ---------- Info pages ----------
export async function getInfoPages(): Promise<InfoPage[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("info_pages")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getInfoPageBySlug(slug: string): Promise<InfoPage | null> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("info_pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}
