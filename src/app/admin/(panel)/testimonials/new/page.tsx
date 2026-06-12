import Link from "next/link";
import { TestimonialForm } from "@/components/admin/forms/testimonial-form";

export const dynamic = "force-dynamic";

export default function NewTestimonialPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/testimonials" className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600">← Back to Testimonials</Link>
      <h1 className="mb-4 text-xl font-bold text-slate-900">New Testimonial</h1>
      <TestimonialForm />
    </div>
  );
}
