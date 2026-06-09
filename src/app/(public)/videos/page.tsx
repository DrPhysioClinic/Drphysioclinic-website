import type { Metadata } from "next";
import { getVideos } from "@/lib/queries";
import { VideoCard } from "@/components/public/cards";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Videos",
  description: "Exercise demos and patient stories from Dr Physio, Ahmedabad.",
};

export default async function VideosPage() {
  const videos = await getVideos();
  return (
    <div className="container-page py-12">
      <h1 className="section-title">Videos</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
        {videos.length === 0 && (
          <p className="col-span-full text-slate-500">No videos published yet.</p>
        )}
      </div>
    </div>
  );
}
