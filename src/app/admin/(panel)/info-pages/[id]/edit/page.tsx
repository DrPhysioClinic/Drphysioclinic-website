import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { InfoPageForm } from "@/components/admin/forms/info-page-form";

export const dynamic = "force-dynamic";

export default async function EditInfoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("info_pages").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-slate-900">Edit Info Page</h1>
      <InfoPageForm page={data} />
    </div>
  );
}
