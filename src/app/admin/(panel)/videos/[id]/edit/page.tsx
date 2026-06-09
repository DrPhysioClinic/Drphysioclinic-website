import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { VideoForm } from "@/components/admin/forms/video-form";

export const dynamic = "force-dynamic";

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("videos").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-slate-900">Edit Video</h1>
      <VideoForm video={data} />
    </div>
  );
}
