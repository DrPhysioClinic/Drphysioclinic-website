"use client";

import { useActionState, useState } from "react";
import { saveUpdate } from "@/app/admin/(panel)/actions";
import { emptySave } from "@/app/admin/(panel)/form-state";
import { Text, TextArea, Checkbox, SaveBar, Select } from "@/components/admin/fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import { VisibilityControl } from "@/components/admin/visibility-control";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import type { Update, Doctor } from "@/types/database";

const CATEGORIES = [
  { value: "Conditions & Recovery", label: "Conditions & Recovery" },
  { value: "Exercise & Prevention", label: "Exercise & Prevention" },
  { value: "Clinic News", label: "Clinic News" },
];

export function UpdateForm({ update, doctors = [] }: { update?: Update; doctors?: Doctor[] }) {
  const [state, action] = useActionState(saveUpdate, emptySave);
  const reviewedAt = update?.reviewed_at ? update.reviewed_at.slice(0, 10) : "";

  // SEO states
  const [seoTitle, setSeoTitle] = useState(update?.seo_title || "");
  const [seoDesc, setSeoDesc] = useState(update?.seo_description || "");

  // Slug lock state
  const isPublished = update?.is_published ?? false;
  const [slugLocked, setSlugLocked] = useState(isPublished);
  const [slug, setSlug] = useState(update?.slug || "");

  const handleUnlockSlug = () => {
    if (window.confirm("Changing the slug of a published post will change its URL and create a 301 redirect. Are you sure?")) {
      setSlugLocked(false);
    }
  };

  const doctorOptions = doctors.map(d => ({ value: d.id, label: d.name }));

  return (
    <form action={action} className="space-y-8">
      {update && <input type="hidden" name="id" value={update.id} />}
      {update && <input type="hidden" name="original_slug" value={update.slug} />}
      
      {/* Basic Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Basic Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="title" label="Title" defaultValue={update?.title} required />
          <div className="flex flex-col">
            <label className="label">
              Slug {isPublished && slugLocked && <span className="text-amber-500 text-xs ml-2">(Locked)</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="slug"
                className="input flex-1"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from title"
                readOnly={slugLocked}
              />
              {slugLocked && (
                <button
                  type="button"
                  onClick={handleUnlockSlug}
                  className="px-3 py-2 bg-slate-200 text-sm font-medium rounded hover:bg-slate-300"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          <Select name="category" label="Category" defaultValue={update?.category} options={CATEGORIES} placeholder="Select a category" />
          <Text name="tags" label="Tags (comma separated)" defaultValue={update?.tags?.join(", ")} />
        </div>
        <TextArea name="excerpt" label="Excerpt (Short Summary)" rows={2} defaultValue={update?.excerpt} />
      </section>

      {/* Editor & Media */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 border-b pb-2">Content</h2>
        <ImageUploader name="image_url" label="Featured Image (Used for OG, Cards, and Article Header)" folder="updates" defaultValue={update?.image_url} />
        <RichTextEditor name="content" label="Body Content" defaultValue={update?.content || ""} />
      </section>

      {/* E-E-A-T Panel */}
      <section className="space-y-4 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-900 border-b border-blue-200 pb-2">Author & Review (E-E-A-T)</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select 
            name="author_id" 
            label="Author (Required for Publish)" 
            defaultValue={update?.author_id} 
            options={doctorOptions} 
            placeholder="Select Author" 
          />
          <Select 
            name="reviewed_by" 
            label="Medical Reviewer" 
            defaultValue={update?.reviewed_by} 
            options={doctorOptions} 
            placeholder="Select Reviewer" 
          />
          <Text name="reviewed_at" label="Review Date" type="date" defaultValue={reviewedAt} />
        </div>
      </section>

      {/* SEO Panel */}
      <section className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">SEO Preview</h2>
        
        <div className="mb-4 p-4 bg-white border border-slate-200 rounded shadow-sm">
          <div className="text-[12px] text-slate-500 mb-1">drphysio.clinic › updates › {slug || "auto-generated-slug"}</div>
          <div className="text-[18px] text-[#1a0dab] hover:underline cursor-pointer truncate">
            {seoTitle || update?.title || "Update Title"} | Dr Physio
          </div>
          <div className="text-[14px] text-[#4d5156] line-clamp-2 mt-1 leading-snug">
            {seoDesc || update?.excerpt || "Short summary or excerpt of the article content..."}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex justify-between">
              <label className="label">SEO Title</label>
              <span className={`text-xs ${seoTitle.length > 60 ? "text-red-500" : "text-slate-500"}`}>
                {seoTitle.length} / 60
              </span>
            </div>
            <input
              type="text"
              name="seo_title"
              className="input"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={update?.title || "Default Title"}
            />
          </div>
          <div>
            <div className="flex justify-between">
              <label className="label">SEO Description</label>
              <span className={`text-xs ${seoDesc.length > 155 ? "text-red-500" : "text-slate-500"}`}>
                {seoDesc.length} / 155
              </span>
            </div>
            <input
              type="text"
              name="seo_description"
              className="input"
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              placeholder={update?.excerpt || "Default description"}
            />
          </div>
        </div>
      </section>

      {/* Visibility Settings */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <VisibilityControl 
            initialIsPublished={update?.is_published ?? true} 
            initialScheduledAt={update?.scheduled_at} 
          />
          <div className="mt-2">
            <Checkbox name="is_featured" label="Featured Post" defaultChecked={update?.is_featured ?? false} />
          </div>
        </div>
      </section>

      <SaveBar state={state} label={update ? "Update Post" : "Create Post"} />
    </form>
  );
}
