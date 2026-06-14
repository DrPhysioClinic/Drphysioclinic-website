"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { verifyTurnstile } from "@/lib/turnstile";
import { logEvent } from "@/app/actions/analytics";

export type FormState = {
  ok: boolean;
  message: string;
};

/** Shared guard: honeypot + optional Turnstile. Returns an error state or null. */
async function spamGuard(formData: FormData): Promise<FormState | null> {
  // Honeypot — real users never fill this hidden field.
  if ((formData.get("company") as string)?.trim()) {
    return { ok: false, message: "Submission rejected." };
  }
  const token = formData.get("cf-turnstile-response") as string | null;
  const passed = await verifyTurnstile(token);
  if (!passed) {
    return { ok: false, message: "Spam check failed. Please try again." };
  }
  return null;
}

export async function submitAppointment(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const blocked = await spamGuard(formData);
  if (blocked) return blocked;

  const patient_name = (formData.get("patient_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  if (!patient_name || !phone) {
    return { ok: false, message: "Name and phone are required." };
  }
  if (formData.get("terms_accepted") !== "on") {
    return { ok: false, message: "Please accept the terms to continue." };
  }

  const serviceId = (formData.get("service_id") as string) || null;
  const payload = {
    patient_name,
    phone,
    email: ((formData.get("email") as string) || "").trim() || null,
    service_id: serviceId && serviceId !== "" ? serviceId : null,
    preferred_date: ((formData.get("preferred_date") as string) || "") || null,
    preferred_time: ((formData.get("preferred_time") as string) || "").trim() || null,
    notes: ((formData.get("notes") as string) || "").trim() || null,
    terms_accepted: true,
    source_page: ((formData.get("source_page") as string) || "").trim() || null,
    status: "new",
  };

  try {
    const supabase = createPublicClient();
    const { error } = await supabase.from("appointments").insert(payload);
    if (error) throw error;
    await logEvent("appointment_submit", payload.source_page ?? undefined);
    return { ok: true, message: "Thank you! We'll call you shortly to confirm your appointment." };
  } catch {
    return { ok: false, message: "Something went wrong. Please call us directly." };
  }
}

export async function submitEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await spamGuard(formData);
  if (blocked) return blocked;

  const name = (formData.get("name") as string)?.trim();
  const contact = (formData.get("contact") as string)?.trim();
  if (!name || !contact) {
    return { ok: false, message: "Name and contact are required." };
  }

  const payload = {
    name,
    contact,
    message: ((formData.get("message") as string) || "").trim() || null,
    source_page: ((formData.get("source_page") as string) || "").trim() || null,
    status: "new",
  };

  try {
    const supabase = createPublicClient();
    const { error } = await supabase.from("enquiries").insert(payload);
    if (error) throw error;
    await logEvent("enquiry_submit", payload.source_page ?? undefined);
    return { ok: true, message: "Thanks for reaching out! We'll get back to you soon." };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

export async function subscribeNewsletter(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const blocked = await spamGuard(formData);
  if (blocked) return blocked;

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const source_page = ((formData.get("source_page") as string) || "").trim() || null;

  try {
    const supabase = createPublicClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source_page, status: "active" });
    // Duplicate email (unique constraint) → treat as already subscribed.
    if (error && error.code !== "23505") throw error;
    await logEvent("newsletter_submit", source_page ?? undefined);
    return { ok: true, message: "You're subscribed. Thank you!" };
  } catch {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
