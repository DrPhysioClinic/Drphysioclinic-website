"use client";

import { useActionState } from "react";
import { saveUpdate } from "@/app/admin/(panel)/actions";
import { emptySave } from "@/app/admin/(panel)/form-state";
import { Text, TextArea, Checkbox, SaveBar } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import { VisibilityControl } from "@/components/admin/visibility-control";
import type { Update } from "@/types/database";

export function UpdateForm({ update }: { update?: Update }) {
  const [state, action] = useActionState(saveUpdate, emptySave);
  const publishedAt = update?.published_at ? update.published_at.slice(0, 10) : "";
  return (
    <form action={action} className="space-y-4">
      {update && <input type="hidden" name="id" value={update.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="title" label="Title" defaultValue={update?.title} required />
        <Text name="slug" label="Slug" defaultValue={update?.slug} placeholder="auto from title" />
        <Text name="published_at" label="Publish Date" type="date" defaultValue={publishedAt} />
        <Text name="tags" label="Tags (comma separated)" defaultValue={update?.tags?.join(", ")} />
      </div>
      <TextArea name="excerpt" label="Excerpt" rows={2} defaultValue={update?.excerpt} />
      <TextArea name="content" label="Content" rows={8} defaultValue={update?.content} />
      <ImageUploader name="image_url" label="Cover Image" folder="updates" defaultValue={update?.image_url} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="seo_title" label="SEO Title" defaultValue={update?.seo_title} />
        <Text name="seo_description" label="SEO Description" defaultValue={update?.seo_description} />
      </div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <VisibilityControl 
          initialIsPublished={update?.is_published ?? true} 
          initialScheduledAt={update?.scheduled_at} 
        />
        <div className="mt-2">
          <Checkbox name="is_featured" label="Featured" defaultChecked={update?.is_featured ?? false} />
        </div>
      </div>
      <SaveBar state={state} label={update ? "Update Post" : "Create Post"} />
    </form>
  );
}
