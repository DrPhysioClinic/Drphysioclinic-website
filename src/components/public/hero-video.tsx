"use client";

import { useRef, useState, useEffect } from "react";
import { IconVolume, IconVolumeOff } from "@tabler/icons-react";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.3;
      videoRef.current.muted = true; // explicitly mute to ensure it plays
      
      // Since it is muted, the browser will reliably autoplay it.
      videoRef.current.play().catch((err) => {
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
      className="relative w-full max-w-[340px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl shadow-brand-900/50 border-4 border-white/10"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        loop
        playsInline
        preload="metadata"
        poster="/hero-poster.jpg"
        className="w-full h-full object-cover pointer-events-none"
      >
        <source src="/hero-video-with-audio.mp4" type="video/mp4" />
      </video>
      
      <div 
        className={`absolute bottom-4 right-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <button 
          onClick={toggleMute}
          className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors cursor-pointer pointer-events-auto"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <IconVolumeOff size={20} /> : <IconVolume size={20} />}
        </button>
      </div>
    </div>
  );
}
