import { GalleryForm } from "@/components/admin/forms/gallery-form";

export const dynamic = "force-dynamic";

export default function NewGalleryPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-slate-900">Add Photo</h1>
      <GalleryForm />
    </div>
  );
}
