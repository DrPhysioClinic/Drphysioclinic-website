import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getUpdateBySlug, getUpdates, getResolvedSettings, getDoctors } from "@/lib/queries";
import { getCanonicalUrl } from "@/lib/utils";
import { createServerSupabase } from "@/lib/supabase/server";
import { JsonLd } from "@/components/json-ld";
import { updateJsonLd } from "@/lib/seo";
import { AuthorByline } from "@/components/public/author-byline";
import { MedicalReview } from "@/components/public/medical-review";
import { UpdateCard } from "@/components/public/cards";

export const revalidate = 3600;

export async function generateStaticParams() {
  const updates = await getUpdates();
  return updates.filter((u) => u.slug).map((u) => ({ slug: u.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const update = await getUpdateBySlug(slug);
  if (!update) {
    const supabase = await createServerSupabase();
    const { data: redir } = await supabase.from("slug_redirects")
      .select("new_slug").eq("entity_type", "update").eq("old_slug", slug).maybeSingle();
    if (redir && redir.new_slug) {
      return { title: "Redirecting..." };
    }
    return { title: "Update not found" };
  }
  return {
    title: update.seo_title || `${update.title} | Dr Physio`,
    description: update.seo_description || update.excerpt || `Read ${update.title} from Dr Physio.`,
    alternates: { canonical: getCanonicalUrl(`/updates/${slug}`) },
    openGraph: {
      title: update.seo_title || `${update.title} | Dr Physio`,
      description: update.seo_description || update.excerpt || `Read ${update.title} from Dr Physio.`,
      url: getCanonicalUrl(`/updates/${slug}`),
      type: "article",
      ...(update.image_url && {
        images: [{ url: update.image_url }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: update.seo_title || `${update.title} | Dr Physio`,
      description: update.seo_description || update.excerpt || `Read ${update.title} from Dr Physio.`,
      ...(update.image_url && {
        images: [update.image_url],
      }),
    },
  };
}

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [update, settings, allDoctors, allUpdates] = await Promise.all([
    getUpdateBySlug(slug), 
    getResolvedSettings(),
    getDoctors(),
    getUpdates()
  ]);
  
  if (!update) {
    const supabase = await createServerSupabase();
    const { data: redir } = await supabase.from("slug_redirects")
      .select("new_slug").eq("entity_type", "update").eq("old_slug", slug).maybeSingle();
    if (redir && redir.new_slug) {
      redirect(`/updates/${redir.new_slug}`);
    }
    notFound();
  }

  const updateData = update as typeof update & {
    author_id?: string | null;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
  };

  const author = allDoctors.find(d => d.id === updateData.author_id);
  const reviewer = allDoctors.find(d => d.id === updateData.reviewed_by);

  return (
    <article className="container-page max-w-3xl pt-28 pb-12">
      <JsonLd data={updateJsonLd(update, settings.clinic_name, author, reviewer)} />
      <Link href="/updates" className="text-sm font-semibold text-brand-600 hover:text-brand-400 transition-colors mb-4 inline-block">
        ← All updates
      </Link>
      <h1 className="text-3xl font-bold text-slate-900">{update.title}</h1>
      <div className="mt-4 border-b border-slate-200 pb-4">
        <AuthorByline author={author} />
        <MedicalReview reviewer={reviewer} reviewedAt={updateData.reviewed_at} />
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-400 flex-wrap">
          {updateData.published_at && (
            <span>
              Published: {new Date(updateData.published_at!).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
          {updateData.updated_at && (
            <>
              {updateData.published_at && <span className="text-slate-300">·</span>}
              <span>
                Last updated: {new Date(updateData.updated_at!).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </>
          )}
        </div>
      </div>
      {update.image_url && (
        <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-xl bg-brand-50">
          <Image src={update.image_url} alt={update.title || "Update"} fill sizes="768px" className="object-cover" priority />
        </div>
      )}
      {update.content && (
        <div 
          className="prose prose-slate mt-6 max-w-none text-slate-700"
          dangerouslySetInnerHTML={{ __html: update.content || "" }}
        />
      )}
      {update.tags && update.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-8">
          {update.tags.map((t) => (
            <span key={t} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Related Posts */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Posts</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {allUpdates
            .filter(u => u.id !== update.id && (update.category ? u.category === update.category : true))
            .slice(0, 2)
            .map(u => (
              <UpdateCard key={u.id} update={u} author={allDoctors.find(d => d.id === u.author_id)} />
            ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 bg-brand-50 rounded-2xl p-8 text-center border border-brand-100">
        <h3 className="text-xl font-bold text-brand-900 mb-2">Need Expert Physiotherapy?</h3>
        <p className="text-brand-700 mb-6 max-w-lg mx-auto">
          Book a consultation with our experienced team to get personalized treatment and start your recovery journey today.
        </p>
        <Link 
          href="/#appointment" 
          className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-colors"
        >
          Book an Appointment
        </Link>
      </div>
    </article>
  );
}
