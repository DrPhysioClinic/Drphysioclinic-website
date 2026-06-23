"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function markNotificationRead(id: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
    
  if (error) {
    console.error("Failed to mark notification read:", error);
    return { error: error.message };
  }
  return { success: true };
}

export async function markAllNotificationsRead() {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  if (error) {
    console.error("Failed to mark all notifications read:", error);
    return { error: error.message };
  }
  return { success: true };
}
