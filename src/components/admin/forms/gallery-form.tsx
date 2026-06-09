"use client";

import { useActionState } from "react";
import { saveGalleryItem } from "@/app/admin/(panel)/actions";
import { emptySave } from "@/app/admin/(panel)/form-state";
import { Text, Checkbox, SaveBar } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { GalleryItem } from "@/types/database";

export function GalleryForm({ item }: { item?: GalleryItem }) {
  const [state, action] = useActionState(saveGalleryItem, emptySave);
  return (
    <form action={action} className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}
      <ImageUploader name="image_url" label="Photo" folder="gallery" defaultValue={item?.image_url} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="title" label="Title" defaultValue={item?.title} />
        <Text name="category" label="Category" defaultValue={item?.category} />
        <Text name="alt_text" label="Alt Text" defaultValue={item?.alt_text} />
        <Text name="sort_order" label="Sort Order" type="number" defaultValue={item?.sort_order ?? 0} />
      </div>
      <div className="flex gap-6">
        <Checkbox name="is_published" label="Published" defaultChecked={item?.is_published ?? true} />
        <Checkbox name="is_featured" label="Featured" defaultChecked={item?.is_featured ?? false} />
      </div>
      <SaveBar state={state} label={item ? "Update Photo" : "Add Photo"} />
    </form>
  );
}
