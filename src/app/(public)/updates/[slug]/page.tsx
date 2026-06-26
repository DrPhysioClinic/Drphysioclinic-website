import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getUpdateBySlug, getUpdates, getResolvedSettings, getDoctors } from "@/lib/queries";
import { getCanonicalUrl } from "@/lib/utils";
import { JsonLd } from "@/components/json-ld";
import { updateJsonLd } from "@/lib/seo";
import { AuthorByline } from "@/components/public/author-byline";
import { MedicalReview } from "@/components/public/medical-review";

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
  if (!update) return { title: "Update not found" };
  return {
    title: update.seo_title || update.title || "Update",
    description: update.seo_description || update.excerpt || undefined,
    alternates: { canonical: getCanonicalUrl(`/updates/${slug}`) },
  };
}

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [update, settings, allDoctors] = await Promise.all([
    getUpdateBySlug(slug), 
    getResolvedSettings(),
    getDoctors()
  ]);
  if (!update) notFound();

  const updateData = update as typeof update & {
    author_id?: string | null;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
  };

  const author = allDoctors.find(d => d.id === updateData.author_id);
  const reviewer = allDoctors.find(d => d.id === updateData.reviewed_by);

  return (
    <article className="container-page max-w-3xl pt-28 pb-12">
      <JsonLd data={updateJsonLd(update, settings.clinic_name)} />
      <Link href="/updates" className="text-sm text-brand-600 hover:text-brand-700">
        ← All updates
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">{update.title}</h1>
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
        <div className="prose prose-slate mt-6 max-w-none whitespace-pre-line text-slate-700">
          {update.content}
        </div>
      )}
      {update.tags && update.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {update.tags.map((t) => (
            <span key={t} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
