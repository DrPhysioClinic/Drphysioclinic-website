import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getConditionBySlug, getConditions, getServices, getResolvedSettings } from "@/lib/queries";
import { getCanonicalUrl } from "@/lib/utils";
import { ServiceCard } from "@/components/public/cards";
import { TrackLink } from "@/components/public/track-link";
import { whatsappHref } from "@/lib/constants";

export const revalidate = 3600;

export async function generateStaticParams() {
  const conditions = await getConditions();
  return conditions.filter((c) => c.slug).map((c) => ({ slug: c.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const condition = await getConditionBySlug(slug);
  if (!condition) return { title: "Condition not found" };
  return {
    title: condition.seo_title || condition.title || "Condition",
    description: condition.seo_description || undefined,
    alternates: { canonical: getCanonicalUrl(`/conditions/${slug}`) },
  };
}

export default async function ConditionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [condition, settings, allServices] = await Promise.all([
    getConditionBySlug(slug),
    getResolvedSettings(),
    getServices(),
  ]);
  
  if (!condition) notFound();

  // Pick up to 3 services to link to as a placeholder for internal linking
  const relatedServices = allServices.slice(0, 3);

  return (
    <div className="container-page pt-28 pb-12">
      <Link href="/" className="text-sm text-brand-600 hover:text-brand-700">
        ← Back to Home
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{condition.title}</h1>

          <div className="prose prose-slate mt-6 max-w-none whitespace-pre-line text-slate-700">
            {condition.body}
          </div>

          <div className="mt-12 space-y-8">
            {condition.symptoms && (
              <div>
                <h2 className="text-xl font-bold text-slate-900">What are the common symptoms?</h2>
                <div className="prose prose-slate mt-3 max-w-none whitespace-pre-line text-slate-700">
                  {condition.symptoms}
                </div>
              </div>
            )}
            
            {condition.treatment && (
              <div>
                <h2 className="text-xl font-bold text-slate-900">How do we treat this condition?</h2>
                <div className="prose prose-slate mt-3 max-w-none whitespace-pre-line text-slate-700">
                  {condition.treatment}
                </div>
              </div>
            )}

            {condition.when_to_see && (
              <div>
                <h2 className="text-xl font-bold text-slate-900">When should you see a physiotherapist?</h2>
                <div className="prose prose-slate mt-3 max-w-none whitespace-pre-line text-slate-700">
                  {condition.when_to_see}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 font-semibold text-slate-900">Need help with {condition.title}?</h3>
            <Link href="/contact#appointment" className="btn-accent w-full">
              Book Appointment
            </Link>
            <TrackLink
              href={whatsappHref(
                settings.whatsapp_number,
                `Hi, I'm looking for help with ${condition.title}.`
              )}
              eventType="whatsapp_click"
              sourcePage={`/conditions/${condition.slug}`}
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
          <h2 className="section-title">Related Treatments</h2>
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
