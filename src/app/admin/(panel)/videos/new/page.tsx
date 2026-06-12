import Link from "next/link";
import { VideoForm } from "@/components/admin/forms/video-form";

export const dynamic = "force-dynamic";

export default function NewVideoPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/videos" className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600">← Back to Videos</Link>
      <h1 className="mb-4 text-xl font-bold text-slate-900">New Video</h1>
      <VideoForm />
    </div>
  );
}
