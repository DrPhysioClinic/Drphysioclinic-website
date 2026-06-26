import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDoctorBySlug, getDoctors, getResolvedSettings } from "@/lib/queries";
import { getCanonicalUrl } from "@/lib/utils";
import { JsonLd } from "@/components/json-ld";
import { physicianJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import { SpinningText } from "@/components/ui/spinning-text";
import { DoctorCredentials } from "@/components/public/doctor-credentials";

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
    title: doctor.seo_title || `${doctor.name} | Dr Physio`,
    description: doctor.seo_description || doctor.specialization || `Book a consultation with ${doctor.name} at Dr Physio, Ahmedabad.`,
    alternates: { canonical: getCanonicalUrl(`/doctors/${slug}`) },
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
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Doctors", url: `${SITE_URL}/doctors` },
          { name: doctor.name, url: `${SITE_URL}/doctors/${doctor.slug}` },
        ])}
      />
      <div className="mt-8 mb-6 relative z-20">
        <Link href="/doctors" className="inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          All Doctors
        </Link>
      </div>
      <div className="mt-4 grid gap-8 md:grid-cols-[240px_1fr]">
        <div 
          className="relative mx-auto aspect-square w-full max-w-[280px]" 
          style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        >
          <div 
            className="absolute inset-0"
            style={{ transform: 'translateZ(0)' }}
          >
            <Image
              src={doctor.slug?.includes('fulwa') ? '/dr-fulwa-final.png' : doctor.slug?.includes('jeetendra') ? '/dr-jeetendra.png' : (doctor.image_url || '/dr-jeetendra.png')}
              alt={doctor.name || "Doctor"}
              fill
              sizes="240px"
              className="object-contain drop-shadow-2xl"
            />
          </div>

        </div>
        <div>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{doctor.name}</h1>
            <div className="text-brand-700 w-16 h-16 flex-shrink-0 relative flex items-center justify-center pointer-events-none mt-1 mr-4">
              <SpinningText radius={7.5} duration={12} className="text-[12px] uppercase font-bold tracking-widest opacity-80">
                grow more • heal more • care more • 
              </SpinningText>
            </div>
          </div>
          <p className="mt-1 font-medium text-brand-600">{doctor.title}</p>
          {doctor.specialization && (
            <p className="mt-3 text-slate-700">{doctor.specialization}</p>
          )}
          <DoctorCredentials doctor={doctor} />
          {doctor.bio && <p className="mt-5 whitespace-pre-line text-slate-700">{doctor.bio}</p>}
          <Link href="/contact#appointment" className="btn-accent mt-6">
            Book an Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}

