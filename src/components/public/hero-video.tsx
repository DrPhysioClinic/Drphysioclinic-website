"use client";

import { useRef, useState, useEffect } from "react";
import { IconVolume, IconVolumeOff } from "@tabler/icons-react";

export function HeroVideo({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = 0.3;
    video.muted = true; // explicitly mute to ensure it plays

    // Autoplay when in view; pause when offscreen or hidden
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.15 }
      );

      observer.observe(video);
      return () => observer.disconnect();
    } else {
      video.play().catch((err) => {
        console.warn("Autoplay blocked.", err);
      });
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      videoRef.current.volume = 0.3;
    }
  };

  return (
    <div 
      className={`relative group w-full max-w-[340px] ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Masked Video and Border Container */}
      <div 
        className="w-full aspect-[9/16] rounded-full overflow-hidden shadow-2xl shadow-brand-900/50 border-4 border-white/10"
        style={{
          maskImage: 'linear-gradient(to top, transparent 0%, black 25%)',
          WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 25%)'
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/hero-poster.jpg"
          className="w-full h-full object-cover pointer-events-none"
        >
          <source src="/hero-video-with-audio.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Unmute Button - placed outside the mask so it remains visible */}
      <div 
        className={`absolute bottom-[25%] right-2 transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-90 lg:opacity-0 lg:group-hover:opacity-100'
        }`}
      >
        <button 
          onClick={toggleMute}
          className="p-3 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all hover:scale-110 cursor-pointer pointer-events-auto shadow-lg"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <IconVolumeOff size={18} /> : <IconVolume size={18} />}
        </button>
      </div>
    </div>
  );
}
