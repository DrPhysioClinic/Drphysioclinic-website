import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/utils";
import { getServices, getServiceCategories } from "@/lib/queries";
import { TreatmentsBrowser } from "@/components/public/treatments-browser";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Physiotherapy Treatments in Ahmedabad",
  description:
    "Physiotherapy, sports injury rehab, pediatric care and more at Dr Physio, Bopal, Ahmedabad.",
  alternates: { canonical: getCanonicalUrl("/treatments") },
};

export default async function TreatmentsPage() {
  const [services, categories] = await Promise.all([getServices(), getServiceCategories()]);
  return (
    <div className="container-page pt-28 pb-12">
      <h1 className="section-title">Physiotherapy Treatments in Ahmedabad</h1>
      <p className="mb-8 mt-2 max-w-2xl text-slate-600">
        We provide evidence-based physiotherapy and rehabilitation in Bopal, Ahmedabad, tailored to your specific recovery needs.
      </p>
      
      <h2 className="text-xl font-bold text-slate-900 mb-4">Comprehensive Physiotherapy Services in Ahmedabad</h2>
      
      <TreatmentsBrowser services={services} categories={categories} />
    </div>
  );
}
