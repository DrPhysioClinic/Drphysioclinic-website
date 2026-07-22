"use client";

import { motion } from "motion/react";

const manifestoItems = [
  {
    num: "01",
    title: "Hands before machines.",
    desc: "Every plan begins with an hour of listening — posture, gait, the small tell of an old injury. Manual therapy leads; devices only assist."
  },
  {
    num: "02",
    title: "Measured, not marketed.",
    desc: "Range of motion, symmetry indices, force plates. We reassess weekly so recovery is a graph, not a hope."
  },
  {
    num: "03",
    title: "Quiet rooms, precise tools.",
    desc: "A studio-grade rehab floor with shockwave, laser, cupping and kinesiology — used sparingly, chosen deliberately."
  }
];

export function ManifestoSection() {
  return (
    <section className="bg-[#0b081c] py-24 text-white">
      <div className="container-page max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-20 gap-8">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase mb-6 flex items-center gap-4">
              <span>02 — MANIFESTO</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
              A practice, not a <span className="italic font-serif font-medium text-slate-200">factory.</span>
            </h2>
          </div>
          <div className="md:max-w-xs text-sm text-slate-400 font-light leading-relaxed pt-2">
            Three principles we return to every morning — before the first patient walks in.
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col">
          {manifestoItems.map((item, index) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-[1fr_2.5fr_1.5fr] gap-8 md:gap-12 py-16 border-t border-slate-800/80 items-center"
            >
              <div className="text-6xl md:text-7xl lg:text-8xl font-light text-slate-200 tracking-tighter">
                {item.num}
              </div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-light text-white">
                {item.title}
              </div>
              <div className="text-sm text-slate-400 font-light leading-relaxed">
                {item.desc}
              </div>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
