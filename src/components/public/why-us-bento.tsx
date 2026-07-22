import Link from "next/link";
import { Star, MapPin, Award, Activity, ShieldCheck } from "lucide-react";

export function WhyUsBento() {
  return (
    <section className="bg-white py-24 text-[#0b081c]">
      <div className="container-page max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-8">
          <div className="max-w-3xl">
            <div className="text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase mb-6 flex items-center gap-4">
              <span>03 — WHY US</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-tight">
              Care with the <span className="italic font-serif font-medium">weight</span> of research, <br className="hidden md:block" />
              the touch of a craftsman.
            </h2>
          </div>
          <div className="mb-2">
            <Link 
              href="/treatments" 
              className="text-[10px] font-semibold tracking-[0.15em] text-[#0b081c] uppercase hover:text-red-600 transition-colors flex items-center gap-2"
            >
              SEE THE TREATMENTS <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          
          {/* Card 1: Expert Care (Spans 2 cols, 2 rows) */}
          <div className="lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-white to-[#0b081c]/30 border border-slate-200 rounded-3xl p-6 lg:p-10 flex flex-col justify-between group hover:border-[#0b081c]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0b081c]/10 transition-all duration-300">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-[#0b081c] uppercase mb-10">
                <Award className="w-4 h-4" />
                <span>EXPERT CARE</span>
              </div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4">
                13 years, <span className="italic font-serif font-medium">one</span> practice.
              </h3>
              <p className="text-slate-600 font-light leading-relaxed max-w-xl text-sm md:text-base">
                Every case walks through Dr. Jeetendra Brahmbhatt personally — MPT (Sports), certified in dry needling, cupping, and manual therapy.
              </p>
            </div>
            
            <div className="mt-12 pt-6 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="font-medium text-base mb-1">MPT</div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-[#0b081c] uppercase">SPORTS & ORTHO</div>
              </div>
              <div>
                <div className="font-medium text-base mb-1">CMT</div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-[#0b081c] uppercase">MANUAL THERAPY</div>
              </div>
              <div>
                <div className="font-medium text-base mb-1">IASTM</div>
                <div className="text-[10px] font-bold tracking-[0.1em] text-[#0b081c] uppercase">SOFT-TISSUE</div>
              </div>
            </div>
          </div>

          {/* Card 2: Highest Rated */}
          <div className="bg-gradient-to-br from-white to-[#0b081c]/30 border border-slate-200 rounded-3xl p-6 lg:p-8 flex flex-col justify-between group hover:border-[#0b081c]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0b081c]/10 transition-all duration-300">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-[#0b081c] uppercase mb-8">
              <Star className="w-4 h-4" />
              <span>HIGHEST RATED</span>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-light mb-2 flex items-center gap-2">
                4.9 
                <svg className="w-7 h-7 text-[#0b081c]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="text-xs md:text-sm text-slate-500 font-light">
                590+ Google reviews
              </div>
            </div>
          </div>

          {/* Card 3: Location */}
          <div className="bg-gradient-to-br from-white to-[#0b081c]/30 border border-slate-200 rounded-3xl p-6 lg:p-8 flex flex-col justify-between group hover:border-[#0b081c]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0b081c]/10 transition-all duration-300">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-[#0b081c] uppercase mb-8">
              <MapPin className="w-4 h-4" />
              <span>LOCATION</span>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-light mb-2 leading-snug">
                Bopal Junction,<br />Ahmedabad
              </div>
              
            </div>
          </div>

          {/* Card 4: Advanced Facilities (Spans 2 cols) */}
          <div className="lg:col-span-2 bg-gradient-to-br from-white to-[#0b081c]/30 border border-slate-200 rounded-3xl p-6 lg:p-8 flex flex-col justify-between group hover:border-[#0b081c]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0b081c]/10 transition-all duration-300">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-[#0b081c] uppercase mb-8">
              <Activity className="w-4 h-4" />
              <span>ADVANCED FACILITIES</span>
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-light mb-6">
                Studio-grade tools — <br className="hidden md:block" />
                <span className="italic font-serif font-medium">used sparingly.</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {['SHOCKWAVE', 'CLASS-IV LASER', 'IASTM', 'CUPPING', 'KINESIO', 'TENS'].map(tool => (
                  <span key={tool} className="px-3 py-1 border border-slate-300/60 rounded-full text-[9px] md:text-[10px] font-bold tracking-[0.1em] text-[#0b081c] uppercase bg-white/50">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 5: Trusted */}
          <div className="bg-gradient-to-br from-white to-[#0b081c]/30 border border-slate-200 rounded-3xl p-6 lg:p-8 flex flex-col justify-between group hover:border-[#0b081c]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0b081c]/10 transition-all duration-300">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-[#0b081c] uppercase mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>TRUSTED</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-xl md:text-2xl lg:text-3xl font-light mb-1">250k+</div>
                <div className="text-[9px] md:text-[10px] text-[#0b081c] font-bold uppercase tracking-wide">Patients treated</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl lg:text-3xl font-light mb-1">98%</div>
                <div className="text-[9px] md:text-[10px] text-[#0b081c] font-bold uppercase tracking-wide">Return-to-activity rate</div>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-light flex items-center gap-2 mt-auto">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Open Mon-Sat &middot; 8:00 - 21:00
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
