import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInfoPageBySlug, getInfoPages } from "@/lib/queries";
import { getCanonicalUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const pages = await getInfoPages();
  return pages.filter((p) => p.slug).map((p) => ({ slug: p.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getInfoPageBySlug(slug);
  if (!page) return { title: "Page not found" };
  return {
    title: page.seo_title || `${page.title} | Dr Physio`,
    description: page.seo_description || `Learn more about ${page.title} at Dr Physio.`,
    alternates: { canonical: getCanonicalUrl(`/info/${slug}`) },
  };
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getInfoPageBySlug(slug);
  if (!page) notFound();

  return (
    <article className="container-page max-w-3xl pt-28 pb-12">
      {page.image_url && (
        <img
          src={page.image_url}
          alt={page.title || "Banner image"}
          className="mb-8 w-full h-auto aspect-video object-cover rounded-2xl shadow-sm bg-slate-100"
        />
      )}
      <h1 className="text-3xl font-bold text-slate-900">{page.title}</h1>
      {page.content && (
        <div 
          className="prose prose-slate mt-6 max-w-none text-slate-700"
          dangerouslySetInnerHTML={{ __html: page.content || "" }}
        />
      )}

      {page.image_urls && page.image_urls.length > 0 && (
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {page.image_urls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${page.title} image ${i + 1}`}
              className="w-full h-auto aspect-video object-cover rounded-xl shadow-sm bg-slate-100"
            />
          ))}
        </div>
      )}
    </article>
  );
}
