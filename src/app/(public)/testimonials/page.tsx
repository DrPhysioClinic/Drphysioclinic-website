import type { Metadata } from "next";
import { getTestimonials } from "@/lib/queries";
import { TestimonialCard } from "@/components/public/cards";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Patient Testimonials",
  description: "Read what our patients say about their recovery at Dr Physio, Ahmedabad.",
};

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();
  return (
    <div className="container-page pt-28 pb-12">
      <h1 className="section-title">Patient Testimonials</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} testimonial={t} />
        ))}
        {testimonials.length === 0 && (
          <p className="col-span-full text-slate-500">No testimonials published yet.</p>
        )}
      </div>
    </div>
  );
}
