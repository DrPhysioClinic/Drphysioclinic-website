"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/constants";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { IconX } from "@tabler/icons-react";

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
  onUrlChange,
}: {
  name: string;
  defaultValue?: string | null;
  folder?: string;
  label?: string;
  onUrlChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Cropper State
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (onUrlChange) onUrlChange(newUrl);
  };

  async function handleFileSelect(file: File) {
    setError("");
    const isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
    if (isHeic) {
      setError("HEIC/HEIF images aren't supported. On iPhone, set Camera → Formats to “Most Compatible”, or convert the photo to JPG/PNG first.");
      return;
    }
    
    setOriginalFile(file);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropImageSrc(reader.result?.toString() || "");
      setCrop(undefined); // Reset crop state when new image opens
    });
    reader.readAsDataURL(file);
  }

  async function uploadBlob(blob: Blob) {
    setBusy(true);
    setError("");
    setCropImageSrc(""); // Close cropper modal
    
    try {
      const file = new File([blob], originalFile?.name || "cropped.png", { type: blob.type || "image/png" });
      const compressed = await Promise.race([
        imageCompression(file, {
          maxWidthOrHeight: 1600,
          maxSizeMB: 0.8,
          fileType: "image/webp",
          useWebWorker: true,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Image processing timed out.")), 45000)
        ),
      ]);

      const supabase = createBrowserSupabase();
      const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      const path = `${folder}/${uuid}.webp`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, compressed, { contentType: "image/webp", upsert: false });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      handleUrlChange(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      setOriginalFile(null);
    }
  }

  async function handleCropComplete() {
    if (!imgRef.current) return;
    
    // Check if user actually made a crop selection, otherwise use full image
    if (!completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      if (originalFile) uploadBlob(originalFile);
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setError("No 2d context");
      return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Canvas is empty");
        return;
      }
      uploadBlob(blob);
    }, "image/png");
  }

  return (
    <div>
      <label className="label">{label}</label>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-start gap-4">
        {url ? (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <Image src={url} alt="preview" fill sizes="96px" className="object-contain p-1" />
          </div>
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
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
              if (f) void handleFileSelect(f);
            }}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-white"
          />
          {busy && <p className="mt-1 text-xs text-slate-500">Compressing &amp; uploading…</p>}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          <input
            type="url"
            placeholder="…or paste an image URL"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="input mt-2"
          />
        </div>
      </div>

      {cropImageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center overflow-hidden rounded-xl bg-white p-6 shadow-2xl">
            <button 
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              onClick={() => { setCropImageSrc(""); setOriginalFile(null); }}
              type="button"
            >
              <IconX size={20} />
            </button>
            <h3 className="mb-4 text-lg font-bold text-slate-900">Crop Image</h3>
            <p className="mb-4 text-sm text-slate-500 text-center">
              Drag to select the area you want to keep. If you don't select an area, the full image will be uploaded.
            </p>
            <div className="relative flex-1 overflow-auto bg-slate-100 border border-slate-200 w-full p-4 text-center">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={cropImageSrc}
                  alt="Crop preview"
                  className="max-h-[50vh] w-auto object-contain"
                />
              </ReactCrop>
            </div>
            <div className="mt-6 flex w-full justify-end gap-3">
              <button 
                type="button" 
                className="btn-outline" 
                onClick={() => { setCropImageSrc(""); setOriginalFile(null); }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleCropComplete}
              >
                Crop &amp; Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
