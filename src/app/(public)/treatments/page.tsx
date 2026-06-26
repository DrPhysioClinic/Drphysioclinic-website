import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/utils";
import { getServices, getServiceCategories } from "@/lib/queries";
import { TreatmentsBrowser } from "@/components/public/treatments-browser";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Treatments & Services",
  description:
    "Physiotherapy, sports injury rehab, pediatric care and more at Dr Physio, Bopal, Ahmedabad.",
  alternates: { canonical: getCanonicalUrl("/treatments") },
};

export default async function TreatmentsPage() {
  const [services, categories] = await Promise.all([getServices(), getServiceCategories()]);
  return (
    <div className="container-page pt-28 pb-12">
      <h1 className="section-title">What physiotherapy treatments do we offer?</h1>
      <p className="mb-8 mt-2 max-w-2xl text-slate-600">
        We provide evidence-based physiotherapy and rehabilitation tailored to your specific needs.
      </p>
      <TreatmentsBrowser services={services} categories={categories} />
    </div>
  );
}
