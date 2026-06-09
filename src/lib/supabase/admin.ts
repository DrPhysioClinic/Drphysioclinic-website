import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client — BYPASSES RLS. Server-only.
 *
 * Default: DO NOT USE. Admin CRUD must go through the authenticated session
 * client in `server.ts` so RLS + is_admin() apply. This exists only for rare
 * server-only maintenance tasks (e.g. scheduled analytics pruning) and will
 * throw if the key is not configured.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Service-role client requested but SUPABASE_SERVICE_ROLE_KEY is not set.");
  }

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
