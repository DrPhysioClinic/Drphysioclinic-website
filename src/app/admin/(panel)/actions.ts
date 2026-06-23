"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { SaveState } from "@/app/admin/(panel)/form-state";

// ---------- parse helpers ----------
const str = (fd: FormData, k: string) => {
  const v = (fd.get(k) as string | null)?.trim();
  return v ? v : null;
};
const num = (fd: FormData, k: string) => {
  const v = (fd.get(k) as string | null)?.trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const int = (fd: FormData, k: string) => {
  const n = num(fd, k);
  return n == null ? 0 : Math.trunc(n);
};
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
const list = (fd: FormData, k: string) => {
  const v = (fd.get(k) as string | null)?.trim();
  if (!v) return [] as string[];
  return v
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
};
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function revalidatePublic() {
  // Low write volume — refresh the whole tree so public ISR pages pick up changes.
  revalidatePath("/", "layout");
}

// ---------- generic row ops (used by list pages / toggles) ----------
type EntityTable =
  | "services"
  | "doctors"
  | "testimonials"
  | "gallery"
  | "updates"
  | "videos"
  | "info_pages"
  | "appointments";

export async function deleteRow(table: EntityTable, id: string, listPath: string) {
  const supabase = await createServerSupabase();
  await supabase.from(table).delete().eq("id", id);
  revalidatePublic();
  revalidatePath(listPath);
}

export async function toggleField(
  table: EntityTable,
  id: string,
  field: "is_published" | "is_featured",
  value: boolean,
  listPath: string
) {
  const supabase = await createServerSupabase();
  await supabase
    .from(table)
    .update({ [field]: value } as never)
    .eq("id", id);
  revalidatePublic();
  revalidatePath(listPath);
}

export async function setLeadStatus(
  table: "appointments" | "enquiries",
  id: string,
  status: string
) {
  const supabase = await createServerSupabase();

  if (table === "appointments") {
    const { data: appt } = await supabase.from("appointments").select("*").eq("id", id).single();
    
    if (appt) {
      // 1. CONFIRMATION LOGIC
      if (status === "confirmed") {
        if (!appt.preferred_date || !appt.preferred_time) {
          return { error: "Cannot confirm: preferred date and time must be set first. Please edit the appointment." };
        }
        
        const payload: any = { status: "confirmed" };
        let zoom_join_url = appt.zoom_join_url;

        if (appt.consultation_type === "online" && !appt.zoom_start_url) {
          try {
            const { createZoomMeeting } = await import("@/lib/zoom");
            const start_time = `${appt.preferred_date}T${appt.preferred_time}:00`;
            const meeting = await createZoomMeeting({
              topic: `Consultation with ${appt.patient_name}`,
              start_time,
              duration: 30,
            });
            payload.zoom_meeting_id = meeting.id?.toString();
            payload.zoom_join_url = meeting.join_url;
            payload.zoom_start_url = meeting.start_url;
            zoom_join_url = meeting.join_url;
          } catch (err: any) {
            console.error("Zoom creation failed:", err);
            return { error: "Failed to create Zoom meeting. Ensure Zoom credentials are correct." };
          }
        }

        const { error: updateError } = await supabase.from("appointments").update(payload).eq("id", id);
        if (updateError) return { error: updateError.message };
        
        if (appt.email && !appt.confirmation_email_sent) {
          const { sendZoomConfirmationEmail, sendClinicConfirmationEmail } = await import("@/lib/email");
          const { data: settings } = await supabase.from("settings").select("email").single();
          const replyTo = settings?.email || "appointments@drphysioclinic.com";

          if (appt.consultation_type === "online" && zoom_join_url) {
            await sendZoomConfirmationEmail(appt.email, appt.patient_name, appt.preferred_date, appt.preferred_time, zoom_join_url, replyTo);
          } else if (appt.consultation_type !== "online") {
            await sendClinicConfirmationEmail(appt.email, appt.patient_name, appt.preferred_date, appt.preferred_time, replyTo);
          }

          await supabase.from("appointments").update({ confirmation_email_sent: true }).eq("id", id);
        }
        
        revalidatePath(`/admin/${table}`);
        return { error: undefined };
      }

      // 2. CANCELLATION LOGIC
      if (status === "cancelled" && appt.email && !appt.cancellation_email_sent) {
        const { sendCancellationEmail } = await import("@/lib/email");
        const { data: settings } = await supabase.from("settings").select("email").single();
        const replyTo = settings?.email || "appointments@drphysioclinic.com";
        await sendCancellationEmail(appt.email, appt.patient_name, replyTo);
        await supabase.from("appointments").update({ cancellation_email_sent: true }).eq("id", id);
      }
    }
  }

  await supabase.from(table).update({ status }).eq("id", id);
  revalidatePath(`/admin/${table}`); 
  return { error: undefined };
}

// ---------- SERVICES ----------
export async function saveService(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (!title) return { error: "Title is required." };

  let faqs: unknown = [];
  const faqsRaw = str(fd, "faqs");
  if (faqsRaw) {
    try {
      faqs = JSON.parse(faqsRaw);
    } catch {
      return { error: "FAQs must be valid JSON (e.g. [{\"question\":\"…\",\"answer\":\"…\"}])." };
    }
  }

  const payload = {
    title,
    slug: str(fd, "slug") || slugify(title),
    category: str(fd, "category"),
    short_description: str(fd, "short_description"),
    full_description: str(fd, "full_description"),
    price: num(fd, "price"),
    old_price: num(fd, "old_price"),
    doctor_id: str(fd, "doctor_id"),
    hero_image_url: str(fd, "hero_image_url"),
    gallery_urls: list(fd, "gallery_urls"),
    tags: list(fd, "tags"),
    faqs: faqs as never,
    seo_title: str(fd, "seo_title"),
    seo_description: str(fd, "seo_description"),
    sort_order: int(fd, "sort_order"),
    is_featured: bool(fd, "is_featured"),
    is_published: bool(fd, "is_published"),
    scheduled_at: str(fd, "scheduled_at"),
  };

  const supabase = await createServerSupabase();
  const { error } = id
    ? await supabase.from("services").update(payload).eq("id", id)
    : await supabase.from("services").insert(payload);
  if (error) return { error: error.message };

  revalidatePublic();
  redirect("/admin/services");
}

// ---------- DOCTORS ----------
export async function saveDoctor(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return { error: "Name is required." };

  const payload = {
    name,
    slug: str(fd, "slug") || slugify(name),
    title: str(fd, "title"),
    specialization: str(fd, "specialization"),
    experience_years: num(fd, "experience_years"),
    education: str(fd, "education"),
    memberships: str(fd, "memberships"),
    registration_no: str(fd, "registration_no"),
    phone: str(fd, "phone"),
    email: str(fd, "email"),
    bio: str(fd, "bio"),
    hero_bio: str(fd, "hero_bio"),
    homepage_label: str(fd, "homepage_label"),
    image_url: str(fd, "image_url"),
    cutout_url: str(fd, "cutout_url"),
    sort_order: int(fd, "sort_order"),
    is_featured: bool(fd, "is_featured"),
    is_published: bool(fd, "is_published"),
    seo_title: str(fd, "seo_title"),
    seo_description: str(fd, "seo_description"),
  };

  const supabase = await createServerSupabase();
  const { error } = id
    ? await supabase.from("doctors").update(payload).eq("id", id)
    : await supabase.from("doctors").insert(payload);
  if (error) return { error: error.message };

  revalidatePublic();
  redirect("/admin/doctors");
}

// ---------- TESTIMONIALS ----------
export async function saveTestimonial(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const id = str(fd, "id");
  const patient_name = str(fd, "patient_name");
  if (!patient_name) return { error: "Patient name is required." };

  const payload = {
    patient_name,
    treatment_category: str(fd, "treatment_category"),
    testimonial: str(fd, "testimonial"),
    rating: num(fd, "rating"),
    image_url: str(fd, "image_url"),
    video_url: str(fd, "video_url"),
    sort_order: int(fd, "sort_order"),
    is_featured: bool(fd, "is_featured"),
    is_published: bool(fd, "is_published"),
  };

  const supabase = await createServerSupabase();
  const { error } = id
    ? await supabase.from("testimonials").update(payload).eq("id", id)
    : await supabase.from("testimonials").insert(payload);
  if (error) return { error: error.message };

  revalidatePublic();
  redirect("/admin/testimonials");
}

// ---------- GALLERY ----------
export async function saveGalleryItem(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const id = str(fd, "id");
  const image_url = str(fd, "image_url");
  if (!image_url) return { error: "An image is required." };

  const payload = {
    title: str(fd, "title"),
    image_url,
    category: str(fd, "category"),
    alt_text: str(fd, "alt_text"),
    sort_order: int(fd, "sort_order"),
    is_featured: bool(fd, "is_featured"),
    is_published: bool(fd, "is_published"),
  };

  const supabase = await createServerSupabase();
  const { error } = id
    ? await supabase.from("gallery").update(payload).eq("id", id)
    : await supabase.from("gallery").insert(payload);
  if (error) return { error: error.message };

  revalidatePublic();
  redirect("/admin/gallery");
}

// ---------- UPDATES ----------
export async function saveUpdate(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (!title) return { error: "Title is required." };

  const payload = {
    title,
    slug: str(fd, "slug") || slugify(title),
    excerpt: str(fd, "excerpt"),
    content: str(fd, "content"),
    image_url: str(fd, "image_url"),
    tags: list(fd, "tags"),
    seo_title: str(fd, "seo_title"),
    seo_description: str(fd, "seo_description"),
    published_at: str(fd, "published_at"),
    is_featured: bool(fd, "is_featured"),
    is_published: bool(fd, "is_published"),
    scheduled_at: str(fd, "scheduled_at"),
  };

  const supabase = await createServerSupabase();
  const { error } = id
    ? await supabase.from("updates").update(payload).eq("id", id)
    : await supabase.from("updates").insert(payload);
  if (error) return { error: error.message };

  revalidatePublic();
  redirect("/admin/updates");
}

// ---------- VIDEOS ----------
export async function saveVideo(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const id = str(fd, "id");
  const title = str(fd, "title");
  let video_url = str(fd, "video_url");
  if (!title) return { error: "Title is required." };
  if (!video_url) return { error: "Video URL is required." };

  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = video_url.match(ytRegex);
  if (match && match[1]) {
    video_url = match[1];
  } else {
    return { error: "Please enter a valid YouTube URL." };
  }

  let thumbnail_url = str(fd, "thumbnail_url");
  if (!thumbnail_url) {
    thumbnail_url = `https://img.youtube.com/vi/${video_url}/maxresdefault.jpg`;
  }

  const payload = {
    title,
    slug: str(fd, "slug") || slugify(title),
    description: str(fd, "description"),
    video_url,
    thumbnail_url,
    category: str(fd, "category"),
    sort_order: int(fd, "sort_order"),
    is_featured: bool(fd, "is_featured"),
    is_published: bool(fd, "is_published"),
  };

  const supabase = await createServerSupabase();
  const { error } = id
    ? await supabase.from("videos").update(payload).eq("id", id)
    : await supabase.from("videos").insert(payload);
  if (error) return { error: error.message };

  revalidatePublic();
  redirect("/admin/videos");
}

// ---------- INFO PAGES ----------
export async function saveInfoPage(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (!title) return { error: "Title is required." };

  const payload = {
    title,
    slug: str(fd, "slug") || slugify(title),
    content: str(fd, "content"),
    seo_title: str(fd, "seo_title"),
    seo_description: str(fd, "seo_description"),
    sort_order: int(fd, "sort_order"),
    is_published: bool(fd, "is_published"),
  };

  const supabase = await createServerSupabase();
  const { error } = id
    ? await supabase.from("info_pages").update(payload).eq("id", id)
    : await supabase.from("info_pages").insert(payload);
  if (error) return { error: error.message };

  revalidatePublic();
  redirect("/admin/info-pages");
}

// ---------- SETTINGS ----------
export async function saveSettings(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const id = str(fd, "id");
  const clinic_name = str(fd, "clinic_name");
  if (!clinic_name) return { error: "Clinic name is required." };

  const payload = {
    clinic_name,
    tagline: str(fd, "tagline"),
    phone_primary: str(fd, "phone_primary"),
    phone_secondary: str(fd, "phone_secondary"),
    whatsapp_number: str(fd, "whatsapp_number"),
    email: str(fd, "email"),
    address: str(fd, "address"),
    google_maps_url: str(fd, "google_maps_url"),
    latitude: num(fd, "latitude"),
    longitude: num(fd, "longitude"),
    opening_hours: str(fd, "opening_hours"),
    logo_url: str(fd, "logo_url"),
    favicon_url: str(fd, "favicon_url"),
    seo_title: str(fd, "seo_title"),
    seo_description: str(fd, "seo_description"),
  };

  const supabase = await createServerSupabase();
  const { error } = id
    ? await supabase.from("settings").update(payload).eq("id", id)
    : await supabase.from("settings").insert(payload);
  if (error) return { error: error.message };

  revalidatePublic();
  return { error: "" };
}

// ---------- SOCIAL LINKS ----------
export async function saveSocialLink(fd: FormData) {
  const id = str(fd, "id");
  const platform = str(fd, "platform");
  if (!platform) return;

  const payload = {
    platform,
    label: str(fd, "label"),
    url: str(fd, "url"),
    username: str(fd, "username"),
    sort_order: int(fd, "sort_order"),
    is_active: bool(fd, "is_active"),
  };

  const supabase = await createServerSupabase();
  if (id) {
    await supabase.from("social_links").update(payload).eq("id", id);
  } else {
    await supabase.from("social_links").insert(payload);
  }
  revalidatePublic();
  revalidatePath("/admin/settings");
}

export async function deleteSocialLink(fd: FormData) {
  const id = str(fd, "id");
  if (!id) return;
  const supabase = await createServerSupabase();
  await supabase.from("social_links").delete().eq("id", id);
  revalidatePublic();
  revalidatePath("/admin/settings");
}

export async function saveAppointment(state: any, fd: FormData) {
  const id = str(fd, "id");
  const preferred_date = str(fd, "preferred_date");
  const preferred_time = str(fd, "preferred_time");
  const notes = str(fd, "notes");

  if (!id || !preferred_date || !preferred_time) {
    return { error: "Date and time are required." } as any;
  }

  const supabase = await createServerSupabase();
  const { data: appt } = await supabase.from("appointments").select("*").eq("id", id).single();
  
  if (!appt) {
    return { error: "Appointment not found." } as any;
  }

  const payload: any = {
    preferred_date,
    preferred_time,
    notes,
    status: "confirmed"
  };

  let zoom_join_url = appt.zoom_join_url;

  if (appt.consultation_type === "online" && !appt.zoom_start_url) {
    try {
      const { createZoomMeeting } = await import("@/lib/zoom");
      
      const start_time = `${preferred_date}T${preferred_time}:00`;
      
      const meeting = await createZoomMeeting({
        topic: `Consultation with ${appt.patient_name}`,
        start_time,
        duration: 30,
      });
      
      payload.zoom_meeting_id = meeting.id?.toString();
      payload.zoom_join_url = meeting.join_url;
      payload.zoom_start_url = meeting.start_url;
      zoom_join_url = meeting.join_url;
    } catch (err: any) {
      console.error("Zoom creation failed:", err);
      return { error: "Failed to create Zoom meeting. Ensure Zoom credentials are correct." } as any;
    }
  }

  const { error } = await supabase.from("appointments").update(payload).eq("id", id);
  
  if (error) {
    return { error: error.message } as any;
  }

  if (appt.email) {
    const { sendZoomConfirmationEmail, sendClinicConfirmationEmail, sendRescheduleEmail } = await import("@/lib/email");
    const { data: settings } = await supabase.from("settings").select("email").single();
    const replyTo = settings?.email || "appointments@drphysioclinic.com";

    const isReschedule = appt.status === "confirmed" && (appt.preferred_date !== preferred_date || appt.preferred_time !== preferred_time);

    if (isReschedule) {
      await sendRescheduleEmail(appt.email, appt.patient_name, preferred_date, preferred_time, appt.consultation_type === "online", replyTo);
    } else {
      if (!appt.confirmation_email_sent) {
        if (appt.consultation_type === "online" && zoom_join_url) {
          await sendZoomConfirmationEmail(appt.email, appt.patient_name, preferred_date, preferred_time, zoom_join_url, replyTo);
        } else if (appt.consultation_type !== "online") {
          await sendClinicConfirmationEmail(appt.email, appt.patient_name, preferred_date, preferred_time, replyTo);
        }
        await supabase.from("appointments").update({ confirmation_email_sent: true }).eq("id", id);
      }
    }
  }

  revalidatePath("/admin/appointments");
  redirect("/admin/appointments");
}

export async function saveDoctorNotes(id: string, notes: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("appointments").update({ doctor_notes: notes }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/appointments");
  return { success: true };
}
