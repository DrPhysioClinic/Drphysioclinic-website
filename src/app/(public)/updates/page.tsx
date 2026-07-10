import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/utils";
import { getUpdates } from "@/lib/queries";
import { UpdatesBrowser } from "@/components/public/updates-browser";


export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Physiotherapy Blog & Health Updates",
    description:
      "Read expert physiotherapy articles, health tips, and clinic updates from Dr Jeetendra Brahmbhatt at Dr Physio in Bopal, Ahmedabad.",
    alternates: { canonical: getCanonicalUrl("/updates") },
  };
}

export default async function UpdatesPage() {
  const updates = await getUpdates();
  const doctors = await import("@/lib/queries").then(m => m.getDoctors());
  
  const CATEGORIES = ["Conditions & Recovery", "Exercise & Prevention", "Clinic News"];

  return (
    <div className="container-page pt-28 pb-12">
      <h1 className="section-title">Updates &amp; Health Tips</h1>
      <UpdatesBrowser updates={updates} doctors={doctors} categories={CATEGORIES} />
    </div>
  );
}
