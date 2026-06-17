"use client";

import { useActionState, useRef, useState } from "react";
import { saveService } from "@/app/admin/(panel)/actions";
import { emptySave } from "@/app/admin/(panel)/form-state";
import { Text, TextArea, Select, Checkbox, SaveBar } from "@/components/admin/fields";
import { VisibilityControl } from "@/components/admin/visibility-control";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ServiceCard } from "@/components/public/cards";
import type { Service, Doctor } from "@/types/database";

export function ServiceForm({
  service,
  doctors,
}: {
  service?: Service;
  doctors: Pick<Doctor, "id" | "name">[];
}) {
  const [state, action] = useActionState(saveService, emptySave);
  const faqsDefault = service?.faqs ? JSON.stringify(service.faqs, null, 2) : "[]";

  const formRef = useRef<HTMLFormElement>(null);
  const [previewData, setPreviewData] = useState<Partial<Service>>({
    id: service?.id || "preview-id",
    slug: service?.slug || "preview",
    title: service?.title || "Treatment Title",
    category: service?.category || "Category",
    short_description: service?.short_description || "Short description goes here...",
    price: service?.price,
    old_price: service?.old_price,
    hero_image_url: service?.hero_image_url || null,
  });

  const handleFormChange = () => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setPreviewData({
      ...previewData,
      title: (fd.get("title") as string) || "Treatment Title",
      slug: (fd.get("slug") as string) || "preview",
      category: (fd.get("category") as string) || "Category",
      short_description: (fd.get("short_description") as string) || "Short description goes here...",
      price: fd.get("price") ? Number(fd.get("price")) : null,
      old_price: fd.get("old_price") ? Number(fd.get("old_price")) : null,
    });
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_350px]">
      <form ref={formRef} onChange={handleFormChange} action={action} className="space-y-4">
        {service && <input type="hidden" name="id" value={service.id} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="title" label="Title" defaultValue={service?.title} required />
          <Text name="slug" label="Slug" defaultValue={service?.slug} placeholder="auto from title" />
          <Text name="category" label="Category" defaultValue={service?.category} />
          <Select
            name="doctor_id"
            label="Linked Doctor"
            defaultValue={service?.doctor_id}
            placeholder="None"
            options={doctors.map((d) => ({ value: d.id, label: d.name ?? "Unnamed" }))}
          />
          <Text name="price" label="Price (₹)" type="number" defaultValue={service?.price} />
          <Text name="old_price" label="Old Price (₹)" type="number" defaultValue={service?.old_price} />
        </div>

        <TextArea name="short_description" label="Short Description" rows={2} defaultValue={service?.short_description} />
        <TextArea name="full_description" label="Full Description" rows={6} defaultValue={service?.full_description} />

        <ImageUploader 
          name="hero_image_url" 
          label="Hero Image" 
          folder="services" 
          defaultValue={service?.hero_image_url} 
          onUrlChange={(url) => setPreviewData((p) => ({ ...p, hero_image_url: url }))}
        />

      <TextArea
        name="gallery_urls"
        label="Gallery Image URLs (one per line)"
        rows={3}
        defaultValue={service?.gallery_urls?.join("\n")}
      />
      <Text name="tags" label="Tags (comma separated)" defaultValue={service?.tags?.join(", ")} />
      <TextArea
        name="faqs"
        label='FAQs (JSON: [{"question":"…","answer":"…"}])'
        rows={4}
        defaultValue={faqsDefault}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="seo_title" label="SEO Title" defaultValue={service?.seo_title} />
        <Text name="seo_description" label="SEO Description" defaultValue={service?.seo_description} />
        <Text name="sort_order" label="Sort Order" type="number" defaultValue={service?.sort_order ?? 0} />
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <VisibilityControl 
          initialIsPublished={service?.is_published ?? true} 
          initialScheduledAt={service?.scheduled_at} 
        />
        <div className="mt-2">
          <Checkbox name="is_featured" label="Featured" defaultChecked={service?.is_featured ?? false} />
        </div>
      </div>

      <SaveBar state={state} label={service ? "Update Service" : "Create Service"} />
      </form>

      <div className="hidden lg:block sticky top-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Live Preview</h2>
        <ServiceCard service={previewData as Service} />
      </div>
    </div>
  );
}
