"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { verifyTurnstile } from "@/lib/turnstile";
import { logEvent } from "@/app/actions/analytics";
import { parseTime } from "@/lib/utils";
import { sendAttendanceEmail, sendAttendanceOtpEmail } from "@/lib/email";
import crypto from "crypto";

export type FormState = {
  ok: boolean;
  message: string;
};

export type InitiateAttendanceState = {
  ok: boolean;
  message: string;
  mode?: "otp" | "code";
  token?: string;
  patientName?: string;
  maskedEmail?: string;
  phone?: string;
  attendanceDate?: string;
  visitType?: "clinic" | "home";
};

function normalizePhone(phone?: string | null): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [user, domain] = parts;
  const visible = user.length <= 2 ? user[0] : user.slice(0, 2);
  return `${visible}***@${domain}`;
}

function getOtpSecret(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.RESEND_API_KEY ||
    "dr-physio-attendance-otp-secret-key"
  );
}

function createHmacSignature(phone: string, secretValue: string, expiresAt: number): string {
  return crypto
    .createHmac("sha256", getOtpSecret())
    .update(`${phone}:${secretValue}:${expiresAt}`)
    .digest("hex");
}

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
    preferred_date: ((formData.get("preferred_date") as string) || "").trim() || null,
    preferred_time: parseTime(((formData.get("preferred_time") as string) || "").trim()),
    notes: ((formData.get("notes") as string) || "").trim() || null,
    consultation_type: ((formData.get("consultation_type") as string) || "in_person"),
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

type PatientRecord = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  code?: string;
};

async function findPatientByPhone(cleanPhone: string): Promise<PatientRecord | null> {
  const supabase = createPublicClient();
  const { data: tree } = await supabase
    .from("reference_trees")
    .select("nodes")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .single();

  if (!tree?.nodes || !Array.isArray(tree.nodes)) return null;

  for (const doc of tree.nodes as unknown as { patients?: PatientRecord[] }[]) {
    if (doc.patients && Array.isArray(doc.patients)) {
      for (const p of doc.patients) {
        if (p.phone && normalizePhone(p.phone) === cleanPhone) {
          return p as PatientRecord;
        }
      }
    }
  }
  return null;
}

async function insertAttendanceRecord(
  supabase: ReturnType<typeof createPublicClient>,
  payload: {
    patient_name: string | null;
    phone: string | null;
    unique_code: string | null;
    attendance_date: string;
    status: string;
  },
  visitType: "clinic" | "home"
) {
  // First attempt to insert with dedicated visit_type column
  const withVisitType = { ...payload, visit_type: visitType };
  const res = await supabase.from("attendances").insert(withVisitType as never);

  if (res.error) {
    // If column visit_type does not exist yet in Postgres schema, fallback to inserting without it
    if (res.error.code === "PGRST204" || res.error.message?.includes("visit_type")) {
      const fallbackRes = await supabase.from("attendances").insert(payload);
      if (fallbackRes.error) throw fallbackRes.error;
      return;
    }
    throw res.error;
  }
}

/** Step 1: User enters visit date & phone number. Checks reference tree and initiates OTP or Code verification. */
export async function initiateAttendance(formData: FormData): Promise<InitiateAttendanceState> {
  const blocked = await spamGuard(formData);
  if (blocked) return { ok: false, message: blocked.message };

  const phone = (formData.get("phone") as string)?.trim() || "";
  const attendanceDate = (formData.get("attendance_date") as string)?.trim() || "";
  const visitTypeRaw = (formData.get("visit_type") as string)?.trim().toLowerCase() || "clinic";
  const visitType: "clinic" | "home" = visitTypeRaw === "home" ? "home" : "clinic";

  if (!attendanceDate) {
    return { ok: false, message: "Visit date is required." };
  }

  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  if (attendanceDate > todayStr) {
    return { ok: false, message: "You cannot select a future date." };
  }

  const cleanPhone = normalizePhone(phone);
  if (!cleanPhone || cleanPhone.length < 10) {
    return { ok: false, message: "Please enter a valid 10-digit phone number." };
  }

  try {
    const patient = await findPatientByPhone(cleanPhone);
    if (!patient) {
      return {
        ok: false,
        message: "Phone number not found in our patient records. If you are an external visitor, please check 'I don't have a registered number'.",
      };
    }

    const hasEmail = Boolean(patient.email && patient.email.trim().length > 0 && patient.email.includes("@"));

    if (hasEmail && patient.email) {
      const email = patient.email.trim();
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour (60 minutes)
      const signature = createHmacSignature(cleanPhone, otp, expiresAt);
      const token = `${cleanPhone}.${expiresAt}.${signature}`;

      await sendAttendanceOtpEmail(email, patient.name, otp);

      return {
        ok: true,
        mode: "otp",
        token,
        patientName: patient.name,
        maskedEmail: maskEmail(email),
        phone: cleanPhone,
        attendanceDate,
        visitType,
        message: `A 6-digit verification code has been sent to ${maskEmail(email)}.`,
      };
    } else {
      // No email entered in reference tree -> requires Unique Code
      const code = (patient.code || "").trim().toUpperCase();
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour (60 minutes)
      const signature = createHmacSignature(cleanPhone, code, expiresAt);
      const token = `${cleanPhone}.${expiresAt}.${signature}`;

      return {
        ok: true,
        mode: "code",
        token,
        patientName: patient.name,
        phone: cleanPhone,
        attendanceDate,
        visitType,
        message: "Please enter your Unique Code to confirm your visit.",
      };
    }
  } catch (err) {
    console.error("initiateAttendance error:", err);
    return { ok: false, message: "Failed to initiate verification. Please try again." };
  }
}

/** Step 2: Verifies submitted OTP or Unique Code and completes attendance recording. */
export async function verifyAttendance(formData: FormData): Promise<FormState> {
  const blocked = await spamGuard(formData);
  if (blocked) return blocked;

  const token = (formData.get("token") as string)?.trim() || "";
  const verificationCode = (formData.get("verification_code") as string)?.trim() || "";
  const phone = (formData.get("phone") as string)?.trim() || "";
  const attendanceDate = (formData.get("attendance_date") as string)?.trim() || "";
  const mode = (formData.get("mode") as string)?.trim() || "";
  const visitTypeRaw = (formData.get("visit_type") as string)?.trim().toLowerCase() || "clinic";
  const visitType: "clinic" | "home" = visitTypeRaw === "home" ? "home" : "clinic";

  if (!token || !verificationCode || !phone || !attendanceDate) {
    return { ok: false, message: "Missing required verification details." };
  }

  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  if (attendanceDate > todayStr) {
    return { ok: false, message: "You cannot select a future date." };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { ok: false, message: "Invalid verification token. Please start over." };
  }

  const [tokenPhone, expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);

  if (Date.now() > expiresAt) {
    return { ok: false, message: "Verification session has expired. Please request a new code." };
  }

  const cleanPhone = normalizePhone(phone);
  if (tokenPhone !== cleanPhone) {
    return { ok: false, message: "Session mismatch. Please restart." };
  }

  try {
    const patient = await findPatientByPhone(cleanPhone);
    if (!patient) {
      return { ok: false, message: "Patient record not found. Please restart." };
    }

    if (mode === "otp") {
      const expectedSig = createHmacSignature(cleanPhone, verificationCode, expiresAt);
      if (expectedSig !== signature) {
        return { ok: false, message: "Incorrect verification code. Please check your email and try again." };
      }
    } else if (mode === "code") {
      const patientCode = (patient.code || "").trim().toUpperCase();
      if (!patientCode || verificationCode.toUpperCase() !== patientCode) {
        return { ok: false, message: "Incorrect Unique Code. Please check and try again." };
      }
    } else {
      return { ok: false, message: "Invalid verification mode." };
    }

    // Success! Determine code to store:
    // If verified via OTP -> store the 6-digit OTP in unique_code
    // If verified via Unique Code -> store the unique code in unique_code
    const codeToStore = mode === "otp" ? verificationCode.trim() : (patient.code || verificationCode.trim());
    const statusVal = visitType === "home" ? "patient_home" : "patient_clinic";

    const supabase = createPublicClient();
    const payload = {
      patient_name: patient.name,
      phone: patient.phone || cleanPhone,
      unique_code: codeToStore,
      attendance_date: attendanceDate,
      status: statusVal,
    };

    await insertAttendanceRecord(supabase, payload, visitType);
    await logEvent("attendance_submit", "attendance_page");

    if (patient.email && patient.name && attendanceDate) {
      await sendAttendanceEmail(patient.email.trim(), patient.name, attendanceDate, visitType);
    }

    return {
      ok: true,
      message: `Attendance registered successfully for ${patient.name}!`,
    };
  } catch (err) {
    console.error("verifyAttendance error:", err);
    return { ok: false, message: "Failed to record attendance. Please try again." };
  }
}

/** Fallback/Walk-in: Used when user checks "I don't have a phone number". */
export async function submitExternalAttendance(formData: FormData): Promise<FormState> {
  const blocked = await spamGuard(formData);
  if (blocked) return blocked;

  const name = (formData.get("name") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const attendanceDate = (formData.get("attendance_date") as string)?.trim() || null;
  const visitTypeRaw = (formData.get("visit_type") as string)?.trim().toLowerCase() || "clinic";
  const visitType: "clinic" | "home" = visitTypeRaw === "home" ? "home" : "clinic";

  if (!attendanceDate) {
    return { ok: false, message: "Visit date is required." };
  }

  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  if (attendanceDate > todayStr) {
    return { ok: false, message: "You cannot select a future date." };
  }

  if (!name) {
    return { ok: false, message: "Full Name is required." };
  }

  try {
    const supabase = createPublicClient();
    const statusVal = visitType === "home" ? "external_home" : "external_clinic";
    const payload = {
      patient_name: name,
      phone: phone || null,
      unique_code: null,
      attendance_date: attendanceDate,
      status: statusVal,
    };

    await insertAttendanceRecord(supabase, payload, visitType);
    await logEvent("attendance_submit", "attendance_page");
    return { ok: true, message: "Attendance registered successfully!" };
  } catch (err) {
    console.error("submitExternalAttendance error:", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

/** Legacy wrapper kept for backwards compatibility. */
export async function submitAttendance(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitExternalAttendance(formData);
}
