"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/constants";
import { 
  IconBold, 
  IconItalic, 
  IconH2, 
  IconH3, 
  IconQuote, 
  IconList, 
  IconListNumbers, 
  IconLink, 
  IconPhoto,
  IconUnlink
} from "@tabler/icons-react";

export function RichTextEditor({
  name,
  defaultValue = "",
  label = "Content",
}: {
  name: string;
  defaultValue?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }, // Force users to start at H2, H1 is for the title
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-600 underline hover:text-brand-700",
        },
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none min-h-[300px] p-4 focus:outline-none border border-slate-200 rounded-b-md bg-white",
      },
    },
  });

  const uploadImage = async (file: File) => {
    setBusy(true);
    try {
      const isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
      if (isHeic) {
        alert("HEIC/HEIF images aren't supported. Please use JPG/PNG.");
        return;
      }

      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 1600,
        maxSizeMB: 0.8,
        fileType: "image/webp",
        useWebWorker: true,
      });

      const supabase = createBrowserSupabase();
      const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      const path = `updates/inline/${uuid}.webp`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, compressed, { contentType: "image/webp", upsert: false });
      
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      
      editor?.chain().focus().setImage({ src: data.publicUrl }).run();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) return;
    // empty
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, disabled, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors ${
        isActive ? "bg-slate-200 text-slate-900" : "text-slate-600"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col">
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      
      {/* Hidden input to pass data to the server action */}
      <input type="hidden" name={name} value={editor.getHTML()} />
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={(e) => {
          if (e.target.files?.[0]) uploadImage(e.target.files[0]);
        }} 
      />

      <div className="border border-b-0 border-slate-200 rounded-t-md bg-slate-50 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <IconH2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
        >
          <IconH3 size={18} />
        </ToolbarButton>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <IconBold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <IconItalic size={18} />
        </ToolbarButton>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
        >
          <IconQuote size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          <IconList size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        >
          <IconListNumbers size={18} />
        </ToolbarButton>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <ToolbarButton onClick={setLink} isActive={editor.isActive("link")}>
          <IconLink size={18} />
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().unsetLink().run()} 
          disabled={!editor.isActive("link")}
        >
          <IconUnlink size={18} />
        </ToolbarButton>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <ToolbarButton 
          onClick={() => fileInputRef.current?.click()} 
          disabled={busy}
        >
          <IconPhoto size={18} className={busy ? "animate-pulse" : ""} />
        </ToolbarButton>
      </div>
      
      <EditorContent editor={editor} />
      
      {busy && (
        <div className="text-xs text-brand-600 mt-1 flex items-center gap-1">
          <span className="w-3 h-3 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></span>
          Uploading image...
        </div>
      )}
    </div>
  );
}
