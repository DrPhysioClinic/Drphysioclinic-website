"use client";

export function HeroPatientStoriesButton() {
  return (
    <button 
      onClick={() => {
        const el = document.getElementById('testimonials');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }}
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
