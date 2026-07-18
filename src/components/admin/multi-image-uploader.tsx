"use client";

import { useState } from "react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { IconX } from "@tabler/icons-react";
import Image from "next/image";

export function MultiImageUploader({
  name,
  defaultValue = [],
  folder = "uploads",
  label = "Images",
}: {
  name: string;
  defaultValue?: string[];
  folder?: string;
  label?: string;
}) {
  const [urls, setUrls] = useState<string[]>(defaultValue || []);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const removeUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="label">{label}</label>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {urls.map((url, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-50">
              <Image src={url} alt={`Image ${i + 1}`} fill sizes="200px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeUrl(i)}
                className="absolute top-2 right-2 bg-white text-red-600 p-1.5 rounded-full shadow-sm hover:bg-red-50 z-10"
              >
                <IconX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-slate-100">
        {!isUploading ? (
          <button
            type="button"
            onClick={() => setIsUploading(true)}
            className="btn-outline text-sm py-1.5 px-3"
          >
            + Add new photo
          </button>
        ) : (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
            >
              <IconX size={16} />
            </button>
            <p className="text-sm font-medium text-slate-700 mb-2">Upload a photo</p>
            <ImageUploader
              key={uploaderKey}
              name={`${name}_temp`}
              folder={folder}
              label=""
              onUrlChange={(url) => {
                if (url) {
                  setUrls((prev) => [...prev, url]);
                  setUploaderKey((k) => k + 1);
                  setIsUploading(false); // hide after successful upload
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
