"use client";

import { useActionState } from "react";
import { saveDoctor } from "@/app/admin/(panel)/actions";
import { emptySave } from "@/app/admin/(panel)/form-state";
import { Text, TextArea, Checkbox, SaveBar } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Doctor } from "@/types/database";

export function DoctorForm({ doctor }: { doctor?: Doctor }) {
  const [state, action] = useActionState(saveDoctor, emptySave);
  return (
    <form action={action} className="space-y-4">
      {doctor && <input type="hidden" name="id" value={doctor.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="name" label="Name" defaultValue={doctor?.name} required />
        <Text name="slug" label="Slug" defaultValue={doctor?.slug} placeholder="auto from name" />
        <Text name="title" label="Title" defaultValue={doctor?.title} />
        <Text name="experience_years" label="Experience (years)" type="number" defaultValue={doctor?.experience_years} />
        <Text name="education" label="Education" defaultValue={doctor?.education} />
        <Text name="memberships" label="Memberships" defaultValue={doctor?.memberships} />
        <Text name="registration_no" label="Registration No." defaultValue={doctor?.registration_no} />
        <Text name="phone" label="Phone" defaultValue={doctor?.phone} />
        <Text name="email" label="Email" defaultValue={doctor?.email} />
      </div>
      <TextArea name="specialization" label="Specialization" rows={2} defaultValue={doctor?.specialization} />
      <TextArea name="bio" label="Bio" rows={5} defaultValue={doctor?.bio} />
      <ImageUploader name="image_url" label="Photo" folder="doctors" defaultValue={doctor?.image_url} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="seo_title" label="SEO Title" defaultValue={doctor?.seo_title} />
        <Text name="seo_description" label="SEO Description" defaultValue={doctor?.seo_description} />
        <Text name="sort_order" label="Sort Order" type="number" defaultValue={doctor?.sort_order ?? 0} />
      </div>
      <div className="flex gap-6">
        <Checkbox name="is_published" label="Published" defaultChecked={doctor?.is_published ?? true} />
        <Checkbox name="is_featured" label="Featured" defaultChecked={doctor?.is_featured ?? false} />
      </div>
      <SaveBar state={state} label={doctor ? "Update Doctor" : "Create Doctor"} />
    </form>
  );
}
