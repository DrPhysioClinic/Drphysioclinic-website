"use client";

import { useActionState } from "react";
import { saveInfoPage } from "@/app/admin/(panel)/actions";
import { emptySave } from "@/app/admin/(panel)/form-state";
import { Text, TextArea, Checkbox, SaveBar } from "@/components/admin/fields";
import type { InfoPage } from "@/types/database";

export function InfoPageForm({ page }: { page?: InfoPage }) {
  const [state, action] = useActionState(saveInfoPage, emptySave);
  return (
    <form action={action} className="space-y-4">
      {page && <input type="hidden" name="id" value={page.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="title" label="Title" defaultValue={page?.title} required />
        <Text name="slug" label="Slug" defaultValue={page?.slug} placeholder="auto from title" />
        <Text name="sort_order" label="Sort Order" type="number" defaultValue={page?.sort_order ?? 0} />
      </div>
      <TextArea name="content" label="Content" rows={10} defaultValue={page?.content} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="seo_title" label="SEO Title" defaultValue={page?.seo_title} />
        <Text name="seo_description" label="SEO Description" defaultValue={page?.seo_description} />
      </div>
      <Checkbox name="is_published" label="Published" defaultChecked={page?.is_published ?? true} />
      <SaveBar state={state} label={page ? "Update Page" : "Create Page"} />
    </form>
  );
}
