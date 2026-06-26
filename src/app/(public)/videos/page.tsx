import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/utils";
import { getVideos } from "@/lib/queries";
import { VideoCard } from "@/components/public/cards";
import { JsonLd } from "@/components/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Videos",
  description: "Exercise demos and patient stories from Dr Physio, Ahmedabad.",
  alternates: { canonical: getCanonicalUrl("/videos") },
};

export default async function VideosPage() {
  const videos = await getVideos();

  const videoJsonLd = videos.map((v) => {
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = (v.video_url || "").match(ytRegex);
    const finalId = match && match[1] ? match[1] : v.video_url || "";
    
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: v.title || "Video",
      description: v.description || v.title || "Video",
      thumbnailUrl: v.thumbnail_url || `https://img.youtube.com/vi/${finalId}/hqdefault.jpg`,
      uploadDate: v.created_at || new Date().toISOString(),
      embedUrl: `https://www.youtube-nocookie.com/embed/${finalId}`,
    };
  });

  return (
    <div className="container-page pt-28 pb-12">
      {videoJsonLd.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
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
