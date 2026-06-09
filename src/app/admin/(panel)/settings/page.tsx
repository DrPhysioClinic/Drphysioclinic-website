import { createServerSupabase } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/forms/settings-form";
import { saveSocialLink, deleteSocialLink } from "@/app/admin/(panel)/actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createServerSupabase();
  const [{ data: settings }, { data: socialLinks }] = await Promise.all([
    supabase.from("settings").select("*").limit(1).maybeSingle(),
    supabase.from("social_links").select("*").order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="max-w-3xl space-y-10">
      <section>
        <h1 className="mb-4 text-xl font-bold text-slate-900">Clinic Settings</h1>
        <SettingsForm settings={settings ?? undefined} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Social Links</h2>

        <div className="space-y-3">
          {(socialLinks ?? []).map((link) => (
            <form
              key={link.id}
              action={saveSocialLink}
              className="card flex flex-wrap items-end gap-3 p-3"
            >
              <input type="hidden" name="id" value={link.id} />
              <div className="flex-1 min-w-[120px]">
                <label className="label">Platform</label>
                <input name="platform" defaultValue={link.platform} className="input" />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="label">Label</label>
                <input name="label" defaultValue={link.label ?? ""} className="input" />
              </div>
              <div className="flex-[2] min-w-[200px]">
                <label className="label">URL</label>
                <input name="url" defaultValue={link.url ?? ""} className="input" />
              </div>
              <label className="flex items-center gap-2 pb-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked={link.is_active} />
                Active
              </label>
              <button type="submit" className="btn-outline">Save</button>
              <button
                type="submit"
                formAction={deleteSocialLink}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </form>
          ))}
        </div>

        {/* Add new */}
        <form action={saveSocialLink} className="card mt-4 flex flex-wrap items-end gap-3 p-3">
          <div className="flex-1 min-w-[120px]">
            <label className="label">Platform</label>
            <input name="platform" placeholder="Instagram" className="input" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="label">Label</label>
            <input name="label" placeholder="Follow us" className="input" />
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="label">URL</label>
            <input name="url" placeholder="https://…" className="input" />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked />
            Active
          </label>
          <button type="submit" className="btn-primary">+ Add Link</button>
        </form>
      </section>
    </div>
  );
}
