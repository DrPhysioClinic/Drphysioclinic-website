import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Authenticated server client for the /admin area and server actions.
 *
 * Reads the logged-in user's session from cookies, so every query runs as that
 * user — RLS + the `is_admin()` check apply. This is the ONLY client admin CRUD
 * should use. Never the service-role key.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component where cookies are read-only.
          // Session refresh is handled by middleware, so this is safe to ignore.
        }
      },
    },
  });
}
