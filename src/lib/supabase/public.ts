import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Public anon client.
 *
 * Used for build-time / ISR reads in Server Components. It carries no user
 * session, so RLS restricts it to published rows (and public inserts on the
 * form tables). Safe to use anywhere on the server during static generation.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY env vars."
    );
  }

  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
