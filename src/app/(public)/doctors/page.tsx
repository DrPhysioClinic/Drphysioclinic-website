import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/utils";
import { getDoctors } from "@/lib/queries";
import { DoctorCard } from "@/components/public/cards";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our Doctors",
  description: "Meet our experienced physiotherapists at Dr Physio, Bopal, Ahmedabad.",
};

export default async function DoctorsPage() {
  const doctors = await getDoctors();
  return (
    <div className="container-page pt-28 pb-12">
      <h1 className="section-title">Our Doctors</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Experienced, compassionate physiotherapists dedicated to your recovery.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {doctors.map((d) => (
          <DoctorCard key={d.id} doctor={d} />
        ))}
        {doctors.length === 0 && (
          <p className="col-span-full text-slate-500">No doctors published yet.</p>
        )}
      </div>
    </div>
  );
}
