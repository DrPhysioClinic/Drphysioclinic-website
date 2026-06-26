import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAreaBySlug, getAreas, getServices, getResolvedSettings } from "@/lib/queries";
import { getCanonicalUrl } from "@/lib/utils";
import { ServiceCard } from "@/components/public/cards";
import { TrackLink } from "@/components/public/track-link";
import { whatsappHref } from "@/lib/constants";

export const revalidate = 3600;

export async function generateStaticParams() {
  const areas = await getAreas();
  return areas.filter((a) => a.slug).map((a) => ({ slug: a.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = await getAreaBySlug(slug);
  if (!area) return { title: "Service Area not found" };
  return {
    title: area.seo_title || area.title || "Service Area",
    description: area.seo_description || undefined,
    alternates: { canonical: getCanonicalUrl(`/areas/${slug}`) },
  };
}

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [area, settings, allServices] = await Promise.all([
    getAreaBySlug(slug),
    getResolvedSettings(),
    getServices(),
  ]);
  
  if (!area) notFound();

  // Pick up to 3 services to link to as a placeholder for internal linking
  const relatedServices = allServices.slice(0, 3);

  return (
    <div className="container-page pt-28 pb-12">
      <Link href="/" className="text-sm text-brand-600 hover:text-brand-700">
        ← Back to Home
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{area.title}</h1>

          <div className="prose prose-slate mt-6 max-w-none whitespace-pre-line text-slate-700">
            {area.body}
          </div>

          <div className="mt-12 space-y-8">
            {area.why_choose_us && (
              <div>
                <h2 className="text-xl font-bold text-slate-900">Why choose us in {area.title}?</h2>
                <div className="prose prose-slate mt-3 max-w-none whitespace-pre-line text-slate-700">
                  {area.why_choose_us}
                </div>
              </div>
            )}
            
            {area.how_to_reach && (
              <div>
                <h2 className="text-xl font-bold text-slate-900">How to reach our clinic?</h2>
                <div className="prose prose-slate mt-3 max-w-none whitespace-pre-line text-slate-700">
                  {area.how_to_reach}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 font-semibold text-slate-900">Looking for a Physio in {area.title}?</h3>
            <Link href="/contact#appointment" className="btn-accent w-full">
              Book Appointment
            </Link>
            <TrackLink
              href={whatsappHref(
                settings.whatsapp_number,
                `Hi, I'm looking for a physiotherapist in ${area.title}.`
              )}
              eventType="whatsapp_click"
              sourcePage={`/areas/${area.slug}`}
              external
              className="btn-outline mt-2 w-full"
            >
              💬 Ask on WhatsApp
            </TrackLink>
          </div>
        </aside>
      </div>

      {relatedServices.length > 0 && (
        <div className="mt-12">
          <h2 className="section-title">Conditions We Treat</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedServices.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
