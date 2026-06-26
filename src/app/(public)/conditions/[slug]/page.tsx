import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getConditionBySlug, getConditions, getServices, getResolvedSettings } from "@/lib/queries";
import { getCanonicalUrl } from "@/lib/utils";
import { ServiceCard } from "@/components/public/cards";
import { TrackLink } from "@/components/public/track-link";
import { whatsappHref, SITE_URL } from "@/lib/constants";
import { JsonLd } from "@/components/json-ld";
import { conditionJsonLd, faqPageJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { AuthorByline } from "@/components/public/author-byline";
import { MedicalReview } from "@/components/public/medical-review";
import { getDoctors } from "@/lib/queries";


export const revalidate = 3600;

export async function generateStaticParams() {
  return []; // Temporarily unpublished
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  notFound(); // Temporarily unpublished
}

export default async function ConditionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  notFound(); // Temporarily unpublished
  
  const { slug } = await params;
  const [condition, settings, allServices, allDoctors] = await Promise.all([
    getConditionBySlug(slug),
    getResolvedSettings(),
    getServices(),
    getDoctors(),
  ]);
  
  if (!condition) notFound();

  // Pick up to 3 services to link to as a placeholder for internal linking
  const relatedServices = allServices.slice(0, 3);

  const conditionData = condition as typeof condition & {
    symptoms?: string | null;
    treatment?: string | null;
    when_to_see?: string | null;
    author_id?: string | null;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
  };

  const author = allDoctors.find(d => d.id === conditionData.author_id);
  const reviewer = allDoctors.find(d => d.id === conditionData.reviewed_by);

  const faqSchema = faqPageJsonLd(conditionData as any);

  return (
    <div className="container-page pt-28 pb-12">
      <JsonLd data={conditionJsonLd(conditionData as any, settings.clinic_name)} />
      {faqSchema ? <JsonLd data={faqSchema as any} /> : null}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Conditions", url: `${SITE_URL}/conditions` },
          { name: conditionData.title, url: `${SITE_URL}/conditions/${conditionData.slug}` },
        ])}
      />
      <Link href="/" className="text-sm text-brand-600 hover:text-brand-700">
        ← Back to Home
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{conditionData.title}</h1>
          
          <div className="mt-4 border-b border-slate-200 pb-4">
            <AuthorByline author={author} />
            <MedicalReview reviewer={reviewer} reviewedAt={conditionData.reviewed_at} />
            {conditionData.updated_at && (
              <div className="mt-1 text-sm text-slate-500">
                Last updated: {new Date(conditionData.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </div>
            )}
          </div>

          <div className="prose prose-slate mt-6 max-w-none whitespace-pre-line text-slate-700">
            {conditionData.body}
          </div>

          <div className="mt-12 space-y-8">
            {conditionData.symptoms && (
              <div>
                <h2 className="text-xl font-bold text-slate-900">What are the common symptoms?</h2>
                <div className="prose prose-slate mt-3 max-w-none whitespace-pre-line text-slate-700">
                  {conditionData.symptoms}
                </div>
              </div>
            )}
            
            {conditionData.treatment && (
              <div>
                <h2 className="text-xl font-bold text-slate-900">How do we treat this condition?</h2>
                <div className="prose prose-slate mt-3 max-w-none whitespace-pre-line text-slate-700">
                  {conditionData.treatment}
                </div>
              </div>
            )}

            {conditionData.when_to_see && (
              <div>
                <h2 className="text-xl font-bold text-slate-900">When should you see a physiotherapist?</h2>
                <div className="prose prose-slate mt-3 max-w-none whitespace-pre-line text-slate-700">
                  {conditionData.when_to_see}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 font-semibold text-slate-900">Need help with {conditionData.title}?</h3>
            <Link href="/contact#appointment" className="btn-accent w-full">
              Book Appointment
            </Link>
            <TrackLink
              href={whatsappHref(
                settings.whatsapp_number,
                `Hi, I'm looking for help with ${conditionData.title}.`
              )}
              eventType="whatsapp_click"
              sourcePage={`/conditions/${conditionData.slug}`}
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
