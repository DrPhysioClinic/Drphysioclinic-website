"use server";

import { createPublicClient } from "@/lib/supabase/public";

/**
 * Logs a lightweight analytics event (call/whatsapp clicks, form submits).
 * Keep payloads minimal. RLS allows public INSERT into analytics_events but
 * blocks public SELECT. Fire-and-forget: never throw to the caller.
 */
export async function logEvent(eventType: string, sourcePage?: string, eventName?: string) {
  try {
    const supabase = createPublicClient();
    await supabase.from("analytics_events").insert({
      event_type: eventType,
      event_name: eventName ?? null,
      source_page: sourcePage ?? null,
    });
  } catch {
    // analytics must never break the UX
  }
}
