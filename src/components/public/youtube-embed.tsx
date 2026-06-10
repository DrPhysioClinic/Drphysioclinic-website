"use client";

import { useState } from "react";
import Image from "next/image";

export function YouTubeEmbed({
  videoId,
  title = "YouTube Video",
  thumbnailUrl,
}: {
  videoId: string;
  title?: string;
  thumbnailUrl?: string | null;
}) {
  const [isPlay, setIsPlay] = useState(false);

  // Safely extract ID in case a full URL was passed in from legacy DB records
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = videoId.match(ytRegex);
  const finalId = match && match[1] ? match[1] : videoId;

  // Fallback to hqdefault if maxresdefault fails
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src.includes("maxresdefault.jpg")) {
      target.src = `https://img.youtube.com/vi/${finalId}/hqdefault.jpg`;
    }
  };

  const finalThumbnail = thumbnailUrl || `https://img.youtube.com/vi/${finalId}/maxresdefault.jpg`;

  if (isPlay) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${finalId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      className="group absolute inset-0 flex h-full w-full items-center justify-center bg-slate-900"
      aria-label={`Play ${title}`}
      onClick={() => setIsPlay(true)}
    >
      <Image
        src={finalThumbnail}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        loading="lazy"
        onError={handleImageError}
        className="object-cover opacity-90 transition-transform group-hover:scale-105"
      />
      <span className="absolute z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-lg transition-transform group-hover:scale-110">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6 ml-1"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </button>
  );
}
