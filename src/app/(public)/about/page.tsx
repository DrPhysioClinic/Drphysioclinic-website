import type { Metadata } from "next";
import Link from "next/link";
import { getResolvedSettings, getDoctors } from "@/lib/queries";
import { DoctorCard } from "@/components/public/cards";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About Dr Physio – Ortho & Sports Injury Clinic, Bopal, Ahmedabad. Our mission, team and approach.",
};

export default async function AboutPage() {
  const [settings, doctors] = await Promise.all([getResolvedSettings(), getDoctors()]);
  return (
    <div className="container-page pt-28 pb-12">
      <h1 className="section-title">About {settings.clinic_name}</h1>
      <p className="mt-4 max-w-3xl text-slate-700">{settings.tagline}</p>
      <p className="mt-4 max-w-3xl text-slate-600">
        We are a multidisciplinary physiotherapy clinic in Bopal, Ahmedabad, offering ortho &amp;
        sports injury rehabilitation, pediatric physiotherapy, a child development center and a
        personal fitness studio. Our team combines evidence-based treatment with personalised care
        to help you move better and recover faster.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {[
          { t: "Expert Care", d: "Experienced, registered physiotherapists." },
          { t: "Personalised Plans", d: "Treatment tailored to your condition and goals." },
          { t: "Modern Facility", d: "Well-equipped clinic and fitness studio in Bopal." },
        ].map((f) => (
          <div key={f.t} className="card p-5">
            <h3 className="font-semibold text-brand-700">{f.t}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="section-title">Our Team</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-xl bg-brand-50 p-8 text-center">
        <h2 className="text-xl font-bold text-brand-800">Ready to start your recovery?</h2>
        <Link href="/contact#appointment" className="btn-accent mt-4">
          Book an Appointment
        </Link>
      </div>
    </div>
  );
}
