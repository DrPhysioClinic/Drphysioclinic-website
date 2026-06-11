"use client";

import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/constants";

/**
 * Compresses an image in the browser (WebP, max ~1600px) and uploads it to
 * Supabase Storage through the admin session, then stores the public URL in a
 * hidden input named `name`. Avoids paid Supabase image transformations.
 */
export function ImageUploader({
  name,
  defaultValue,
  folder = "uploads",
  label = "Image",
}: {
  name: string;
  defaultValue?: string | null;
  folder?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setBusy(true);
    setError("");
    try {
      // HEIC/HEIF (default iPhone format) can't be decoded to a canvas by the
      // browser, which makes compression hang. Reject it with a clear message.
      const isHeic =
        /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
      if (isHeic) {
        throw new Error(
          "HEIC/HEIF images aren't supported by browsers. On iPhone, set Camera → Formats to “Most Compatible”, or convert the photo to JPG/PNG first."
        );
      }

      // Guard against a stuck compression (corrupt/undecodable file): time out.
      const compressed = await Promise.race([
        imageCompression(file, {
          maxWidthOrHeight: 1600,
          maxSizeMB: 0.8,
          fileType: "image/webp",
          useWebWorker: true,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Image processing timed out. Try a JPG/PNG under ~15 MB.")),
            45000
          )
        ),
      ]);

      const supabase = createBrowserSupabase();
      // Fallback for non-HTTPS local network testing where crypto.randomUUID is undefined
      const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      const path = `${folder}/${uuid}.webp`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, compressed, { contentType: "image/webp", upsert: false });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-start gap-4">
        {url ? (
          <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <Image src={url} alt="preview" fill sizes="96px" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
            No image
          </div>
        )}
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-white"
          />
          {busy && <p className="mt-1 text-xs text-slate-500">Compressing &amp; uploading…</p>}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          <input
            type="url"
            placeholder="…or paste an image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input mt-2"
          />
        </div>
      </div>
    </div>
  );
}
