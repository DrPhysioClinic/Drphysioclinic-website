import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ServiceForm } from "@/components/admin/forms/service-form";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const [{ data: service }, { data: doctors }] = await Promise.all([
    supabase.from("services").select("*").eq("id", id).maybeSingle(),
    supabase.from("doctors").select("id, name").order("sort_order", { ascending: true }),
  ]);
  if (!service) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/services" className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600">← Back to Services</Link>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Edit Service</h1>
      <ServiceForm service={service} doctors={doctors ?? []} />
    </div>
  );
}
