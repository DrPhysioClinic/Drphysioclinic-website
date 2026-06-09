"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export type AuthState = { error: string };

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Invalid email or password." };
  }

  // Verify the signed-in user is actually an admin (is_admin() via RLS check).
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { error: "This account is not authorized for admin access." };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
