"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Browser client bound to the logged-in admin's session (cookie-based).
 * Used in admin client components for Storage uploads and the auth flow.
 * RLS + is_admin() still apply.
 */
export function createBrowserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
