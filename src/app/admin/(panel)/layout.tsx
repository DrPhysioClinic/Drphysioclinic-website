import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Defense in depth: middleware checks auth, here we confirm admin role.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const { data: settings } = await supabase.from("settings").select("logo_url").limit(1).maybeSingle();

  return (
    <>
      <AdminShell userEmail={user.email ?? ""} logoUrl={settings?.logo_url}>{children}</AdminShell>
      <Toaster position="bottom-right" richColors />
    </>
  );
}
