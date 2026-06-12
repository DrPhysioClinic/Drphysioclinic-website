"use client";

import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "The physiotherapy sessions completely healed my chronic back pain. The staff is professional, caring, and truly listens to your body's needs.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
    name: "Priya Sharma",
    role: "Patient",
  },
  {
    text: "Recovering from my sports injury was tough, but the expert guidance here got me back on the field much faster than expected.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces",
    name: "Rahul Verma",
    role: "Athlete",
  },
  {
    text: "Exceptional care! They use the latest techniques and the clinic environment is incredibly soothing and clean.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    name: "Anjali Gupta",
    role: "Patient",
  },
  {
    text: "My posture has improved dramatically. The tailored exercise plans and consistent check-ins made all the difference.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    name: "Karan Patel",
    role: "IT Professional",
  },
  {
    text: "I was struggling with knee pain for years. Just a few sessions in, and I already feel a massive reduction in pain.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
    name: "Neha Singh",
    role: "Patient",
  },
  {
    text: "They don't just treat the symptoms; they find the root cause. I finally have a pain-free life thanks to their dedicated team.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    name: "Vikram Malhotra",
    role: "Patient",
  },
  {
    text: "The post-surgery rehabilitation was perfectly paced. I regained my mobility safely and with complete confidence in my body.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    name: "Simran Kaur",
    role: "Patient",
  },
  {
    text: "Highly recommended! The therapists are very knowledgeable and took the time to explain every step of my recovery.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces",
    name: "Arjun Reddy",
    role: "Patient",
  },
  {
    text: "A truly holistic approach to wellness. The combination of manual therapy and exercise has changed my life.",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=faces",
    name: "Meera Desai",
    role: "Patient",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const TestimonialsSection = () => {
  return (
    <section className="bg-slate-50 py-20 relative overflow-hidden border-t border-slate-200">
      <div className="container-page relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[640px] mx-auto text-center"
        >
          <div className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 mb-6">
            Testimonials
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            What our patients say
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Real stories of recovery and renewed strength from the people we care for.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-14 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[640px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={25} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={35} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={28} />
        </div>
      </div>
    </section>
  );
};
