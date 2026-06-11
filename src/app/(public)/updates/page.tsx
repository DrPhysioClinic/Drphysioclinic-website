import type { Metadata } from "next";
import { getUpdates } from "@/lib/queries";
import { UpdateCard } from "@/components/public/cards";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Updates & Health Tips",
  description: "News, health tips and articles from Dr Physio, Ahmedabad.",
};

export default async function UpdatesPage() {
  const updates = await getUpdates();
  return (
    <div className="container-page pt-28 pb-12">
      <h1 className="section-title">Updates &amp; Health Tips</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {updates.map((u) => (
          <UpdateCard key={u.id} update={u} />
        ))}
        {updates.length === 0 && (
          <p className="col-span-full text-slate-500">No updates published yet.</p>
        )}
      </div>
    </div>
  );
}
