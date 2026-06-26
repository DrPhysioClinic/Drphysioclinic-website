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
      <h1 className="text-3xl font-bold text-slate-900">{page.title}</h1>
      {page.content && (
        <div className="prose prose-slate mt-6 max-w-none whitespace-pre-line text-slate-700">
          {page.content}
        </div>
      )}
    </article>
  );
}
