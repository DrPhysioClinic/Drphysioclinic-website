"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { headers } from "next/headers";
import crypto from "crypto";

/**
 * Logs a lightweight analytics event (call/whatsapp clicks, form submits, pageviews).
 * Keep payloads minimal. RLS allows public INSERT into analytics_events but
 * blocks public SELECT. Fire-and-forget: never throw to the caller.
 */
export async function logEvent(eventType: string, sourcePage?: string, eventName?: string) {
  try {
    const supabase = createPublicClient();
    
    // Hash the IP address to uniquely identify visitors without storing PII
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    const ip = forwardedFor.split(",")[0].trim();
    
    let ipHash = null;
    if (ip && ip !== "unknown") {
      // Salt the hash with a local secret if available, otherwise just hash it
      const salt = process.env.TURNSTILE_SECRET_KEY || "dr-physio-salt";
      ipHash = crypto.createHash("sha256").update(ip + salt).digest("hex");
    }

    const userAgent = headersList.get("user-agent") || null;

    await supabase.from("analytics_events").insert({
      event_type: eventType,
      event_name: eventName ?? null,
      source_page: sourcePage ?? null,
      ip_hash: ipHash,
      user_agent: userAgent,
    });
  } catch {
    // analytics must never break the UX
  }
}
