"use client";

export function HeroPatientStoriesButton() {
  const handleScroll = () => {
    const el = document.getElementById('testimonials');
    if (!el) return;
    
    // Calculate target position (offset by header if needed, but going to exact top here)
    const targetY = el.getBoundingClientRect().top + window.scrollY;
    const startY = window.scrollY;
    const difference = targetY - startY;
    const duration = 1200; // 1.2 seconds for a luxurious, unhurried scroll
    const startTime = performance.now();

    // Easing function for buttery smooth acceleration and deceleration
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (currentTime: number) => {
      let progress = (currentTime - startTime) / duration;
      if (progress > 1) progress = 1;
      
      const ease = easeInOutCubic(progress);
      window.scrollTo(0, startY + difference * ease);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <button 
      onClick={handleScroll}
      className="flex items-center gap-4 group cursor-pointer"
    >
      <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center bg-white/5 transition-all duration-300 group-hover:bg-white/10 group-hover:scale-105 group-hover:border-white/40">
        <div className="w-0 h-0 border-y-[7px] border-y-transparent border-l-[10px] border-l-white ml-1"></div>
      </div>
      <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-white/90 font-outfit">
        Watch Patient Stories
      </span>
    </button>
  );
}
