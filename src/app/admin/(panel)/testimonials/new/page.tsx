import { TestimonialForm } from "@/components/admin/forms/testimonial-form";

export const dynamic = "force-dynamic";

export default function NewTestimonialPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-slate-900">New Testimonial</h1>
      <TestimonialForm />
    </div>
  );
}
