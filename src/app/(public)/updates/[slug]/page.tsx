import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getUpdateBySlug, getUpdates, getResolvedSettings } from "@/lib/queries";
import { getCanonicalUrl } from "@/lib/utils";
import { JsonLd } from "@/components/json-ld";
import { updateJsonLd } from "@/lib/seo";

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
  const [update, settings] = await Promise.all([getUpdateBySlug(slug), getResolvedSettings()]);
  if (!update) notFound();

  return (
    <article className="container-page max-w-3xl pt-28 pb-12">
      <JsonLd data={updateJsonLd(update, settings.clinic_name)} />
      <Link href="/updates" className="text-sm text-brand-600 hover:text-brand-700">
        ← All updates
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">{update.title}</h1>
      {update.published_at && (
        <p className="mt-2 text-sm text-slate-400">
          {new Date(update.published_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}
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
