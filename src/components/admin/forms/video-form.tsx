"use client";

import { useActionState } from "react";
import { saveVideo } from "@/app/admin/(panel)/actions";
import { emptySave } from "@/app/admin/(panel)/form-state";
import { Text, TextArea, Checkbox, SaveBar } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Video } from "@/types/database";

export function VideoForm({ video }: { video?: Video }) {
  const [state, action] = useActionState(saveVideo, emptySave);
  return (
    <form action={action} className="space-y-4">
      {video && <input type="hidden" name="id" value={video.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="title" label="Title" defaultValue={video?.title} required />
        <Text name="slug" label="Slug" defaultValue={video?.slug} placeholder="auto from title" />
        <Text name="video_url" label="Video URL (YouTube etc.)" defaultValue={video?.video_url} required />
        <Text name="category" label="Category" defaultValue={video?.category} />
        <Text name="sort_order" label="Sort Order" type="number" defaultValue={video?.sort_order ?? 0} />
      </div>
      <TextArea name="description" label="Description" rows={3} defaultValue={video?.description} />
      <ImageUploader name="thumbnail_url" label="Thumbnail" folder="videos" defaultValue={video?.thumbnail_url} />
      <div className="flex gap-6">
        <Checkbox name="is_published" label="Published" defaultChecked={video?.is_published ?? true} />
        <Checkbox name="is_featured" label="Featured" defaultChecked={video?.is_featured ?? false} />
      </div>
      <SaveBar state={state} label={video ? "Update Video" : "Create Video"} />
    </form>
  );
}
