import { VideoForm } from "@/components/admin/forms/video-form";

export const dynamic = "force-dynamic";

export default function NewVideoPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-slate-900">New Video</h1>
      <VideoForm />
    </div>
  );
}
