import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { GalleryForm } from "@/components/admin/forms/gallery-form";

export const dynamic = "force-dynamic";

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("gallery").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/gallery" className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600">← Back to Gallery</Link>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Edit Photo</h1>
      <GalleryForm item={data} />
    </div>
  );
}
