import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/utils";
import { getGallery } from "@/lib/queries";
import { GalleryBrowser } from "@/components/public/gallery-browser";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of our clinic, equipment and treatments at Dr Physio, Ahmedabad.",
};

export default async function GalleryPage() {
  const items = await getGallery();
  return (
    <div className="container-page pt-28 pb-12">
      <h1 className="section-title">Gallery</h1>
      <p className="mb-6 mt-2 text-slate-600">A look inside our clinic and facilities.</p>
      {items.length === 0 ? (
        <p className="text-slate-500">No photos published yet.</p>
      ) : (
        <GalleryBrowser items={items} />
      )}
    </div>
  );
}
