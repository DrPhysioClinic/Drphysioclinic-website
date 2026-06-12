import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { UpdateForm } from "@/components/admin/forms/update-form";

export const dynamic = "force-dynamic";

export default async function EditUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("updates").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="max-w-3xl">
      <Link href="/admin/updates" className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600">← Back to Updates</Link>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Edit Post</h1>
      <UpdateForm update={data} />
    </div>
  );
}
