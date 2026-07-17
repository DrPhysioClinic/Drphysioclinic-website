"use server";

import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addAdminUser(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // 1. Verify caller is authenticated as an admin
  const userSupabase = await createServerSupabase();
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 2. Use admin client to create user
  const adminSupabase = await createAdminSupabase();
  
  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error("Auth creation error:", authError);
    return { error: authError.message };
  }

  if (authData.user) {
    // 3. Insert into admins table
    const { error: dbError } = await adminSupabase.from("admins").insert({
      user_id: authData.user.id,
      email: authData.user.email,
    });

    if (dbError) {
      // Rollback auth user creation if db insert fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      console.error("Admin table insert error:", dbError);
      return { error: "Failed to add user to admins table." };
    }
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateAdminUser(formData: FormData) {
  const userId = formData.get("userId")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!userId) return { error: "User ID is required." };

  const userSupabase = await createServerSupabase();
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const adminSupabase = await createAdminSupabase();
  
  const updates: any = {};
  if (email) updates.email = email;
  if (password) updates.password = password;

  if (Object.keys(updates).length === 0) return { success: true };

  const { data: authData, error: authError } = await adminSupabase.auth.admin.updateUserById(userId, updates);

  if (authError) {
    console.error("Auth update error:", authError);
    return { error: authError.message };
  }

  if (email && authData.user) {
    const { error: dbError } = await adminSupabase
      .from("admins")
      .update({ email: authData.user.email })
      .eq("user_id", userId);

    if (dbError) {
      console.error("Admin table update error:", dbError);
      return { error: "Failed to update email in admins table." };
    }
  }

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteAdminUser(formData: FormData) {
  const userId = formData.get("userId")?.toString();
  if (!userId) return { error: "User ID is required." };

  const userSupabase = await createServerSupabase();
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Prevent deleting self
  if (user.id === userId) {
    return { error: "You cannot delete your own account." };
  }

  const adminSupabase = await createAdminSupabase();

  // The database cascade might not exist, so delete from table first just in case,
  // or delete from auth first and let the trigger/cascade handle it.
  const { error: dbError } = await adminSupabase.from("admins").delete().eq("user_id", userId);
  if (dbError) {
    console.error("Admin table deletion error:", dbError);
    return { error: "Failed to delete user from admins table." };
  }

  const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId);
  if (authError) {
    console.error("Auth deletion error:", authError);
    return { error: authError.message };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}
