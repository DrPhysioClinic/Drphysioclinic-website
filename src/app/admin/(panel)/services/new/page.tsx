import { createServerSupabase } from "@/lib/supabase/server";
import { ServiceForm } from "@/components/admin/forms/service-form";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const supabase = await createServerSupabase();
  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, name")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-slate-900">New Service</h1>
      <ServiceForm doctors={doctors ?? []} />
    </div>
  );
}
