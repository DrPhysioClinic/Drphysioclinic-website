import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getServiceBySlug, getServices, getResolvedSettings } from "@/lib/queries";
import { createPublicClient } from "@/lib/supabase/public";
import { ServiceCard } from "@/components/public/cards";
import { TrackLink } from "@/components/public/track-link";
import { JsonLd } from "@/components/json-ld";
import { treatmentJsonLd } from "@/lib/seo";
import { whatsappHref } from "@/lib/constants";
import type { Doctor } from "@/types/database";

export const revalidate = 3600;

export async function generateStaticParams() {
  const services = await getServices();
  return services.filter((s) => s.slug).map((s) => ({ slug: s.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Treatment not found" };
  return {
    title: service.seo_title || service.title || "Treatment",
    description: service.seo_description || service.short_description || undefined,
  };
}

export default async function TreatmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, settings, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getResolvedSettings(),
    getServices(),
  ]);
  if (!service) notFound();

  // Linked doctor (by id)
  let doctor: Doctor | null = null;
  if (service.doctor_id) {
    try {
      const supabase = createPublicClient();
      const { data } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", service.doctor_id)
        .eq("is_published", true)
        .maybeSingle();
      doctor = data ?? null;
    } catch {
      doctor = null;
    }
  }

  const related = allServices
    .filter((s) => s.id !== service.id && s.category === service.category)
    .slice(0, 3);

  const faqs = Array.isArray(service.faqs)
    ? (service.faqs as { question?: string; answer?: string }[])
    : [];

  return (
    <div className="container-page py-12">
      <JsonLd data={treatmentJsonLd(service, settings.clinic_name)} />
      <Link href="/treatments" className="text-sm text-brand-600 hover:text-brand-700">
        ← All treatments
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {service.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {service.category}
            </span>
          )}
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{service.title}</h1>

          <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-xl bg-brand-50">
            <Image
              src={service.hero_image_url || "https://placehold.co/800x450/eefcf9/157f76?text=Treatment"}
              alt={service.title || "Treatment"}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              priority
            />
          </div>

          {service.full_description && (
            <div className="prose prose-slate mt-6 max-w-none whitespace-pre-line text-slate-700">
              {service.full_description}
            </div>
          )}

          {service.gallery_urls?.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {service.gallery_urls.map((url, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-brand-50">
                  <Image src={url} alt={`${service.title} ${i + 1}`} fill sizes="33vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          {service.tags?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {service.tags.map((t) => (
                <span key={t} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {faqs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">FAQs</h2>
              <div className="mt-3 space-y-3">
                {faqs.map((f, i) => (
                  <details key={i} className="card p-4">
                    <summary className="cursor-pointer font-medium text-slate-800">
                      {f.question}
                    </summary>
                    <p className="mt-2 text-sm text-slate-600">{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-5">
            {service.price != null && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl font-bold text-brand-700">₹{service.price}</span>
                {service.old_price != null && (
                  <span className="text-slate-400 line-through">₹{service.old_price}</span>
                )}
              </div>
            )}
            <Link href="/contact#appointment" className="btn-accent w-full">
              Book Appointment
            </Link>
            <TrackLink
              href={whatsappHref(
                settings.whatsapp_number,
                `Hi, I'm interested in ${service.title}.`
              )}
              eventType="whatsapp_click"
              sourcePage={`/treatments/${service.slug}`}
              external
              className="btn-outline mt-2 w-full"
            >
              💬 Ask on WhatsApp
            </TrackLink>
          </div>

          {doctor && (
            <Link href={`/doctors/${doctor.slug}`} className="card flex items-center gap-3 p-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full bg-brand-50">
                <Image
                  src={doctor.image_url || "https://placehold.co/100x100/eefcf9/157f76?text=Dr"}
                  alt={doctor.name || "Doctor"}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-slate-500">Treated by</p>
                <p className="font-semibold text-slate-900">{doctor.name}</p>
                <p className="text-xs text-brand-600">{doctor.title}</p>
              </div>
            </Link>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="section-title">Related Treatments</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
