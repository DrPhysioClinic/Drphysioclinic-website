"use client";

import { useActionState } from "react";
import { saveTestimonial } from "@/app/admin/(panel)/actions";
import { emptySave } from "@/app/admin/(panel)/form-state";
import { Text, TextArea, Select, Checkbox, SaveBar } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Testimonial } from "@/types/database";

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const [state, action] = useActionState(saveTestimonial, emptySave);
  return (
    <form action={action} className="space-y-4">
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Text name="patient_name" label="Patient Name" defaultValue={testimonial?.patient_name} required />
        <Text name="treatment_category" label="Treatment Category" defaultValue={testimonial?.treatment_category} />
        <Select
          name="rating"
          label="Rating"
          defaultValue={String(testimonial?.rating ?? 5)}
          options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star` }))}
        />
        <Text name="sort_order" label="Sort Order" type="number" defaultValue={testimonial?.sort_order ?? 0} />
        <Text name="video_url" label="Video URL (optional)" defaultValue={testimonial?.video_url} />
      </div>
      <TextArea name="testimonial" label="Testimonial" rows={4} defaultValue={testimonial?.testimonial} />
      <ImageUploader name="image_url" label="Patient Photo" folder="testimonials" defaultValue={testimonial?.image_url} />
      <div className="flex gap-6">
        <Checkbox name="is_published" label="Published" defaultChecked={testimonial?.is_published ?? true} />
        <Checkbox name="is_featured" label="Featured" defaultChecked={testimonial?.is_featured ?? false} />
      </div>
      <SaveBar state={state} label={testimonial ? "Update Testimonial" : "Create Testimonial"} />
    </form>
  );
}
