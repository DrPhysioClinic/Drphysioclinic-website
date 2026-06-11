import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDoctorBySlug, getDoctors, getResolvedSettings } from "@/lib/queries";
import { JsonLd } from "@/components/json-ld";
import { physicianJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const doctors = await getDoctors();
  return doctors.filter((d) => d.slug).map((d) => ({ slug: d.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) return { title: "Doctor not found" };
  return {
    title: doctor.seo_title || doctor.name || "Doctor",
    description: doctor.seo_description || doctor.specialization || undefined,
  };
}

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [doctor, settings] = await Promise.all([getDoctorBySlug(slug), getResolvedSettings()]);
  if (!doctor) notFound();

  return (
    <div className="container-page pt-28 pb-12">
      <JsonLd data={physicianJsonLd(doctor, settings.clinic_name)} />
      <Link href="/doctors" className="text-sm text-brand-600 hover:text-brand-700">
        ← All doctors
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-[240px_1fr]">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-brand-50">
          <Image
            src={doctor.image_url || "https://placehold.co/400x400/eefcf9/157f76?text=Dr"}
            alt={doctor.name || "Doctor"}
            fill
            sizes="240px"
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{doctor.name}</h1>
          <p className="mt-1 font-medium text-brand-600">{doctor.title}</p>
          {doctor.specialization && (
            <p className="mt-3 text-slate-700">{doctor.specialization}</p>
          )}
          <dl className="mt-5 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {doctor.experience_years != null && (
              <Detail label="Experience" value={`${doctor.experience_years} years`} />
            )}
            {doctor.education && <Detail label="Education" value={doctor.education} />}
            {doctor.memberships && <Detail label="Memberships" value={doctor.memberships} />}
            {doctor.registration_no && (
              <Detail label="Registration" value={doctor.registration_no} />
            )}
          </dl>
          {doctor.bio && <p className="mt-5 whitespace-pre-line text-slate-700">{doctor.bio}</p>}
          <Link href="/contact#appointment" className="btn-accent mt-6">
            Book an Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  );
}
