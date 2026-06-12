import Link from "next/link";
import { UpdateForm } from "@/components/admin/forms/update-form";

export const dynamic = "force-dynamic";

export default function NewUpdatePage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/updates" className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600">← Back to Updates</Link>
      <h1 className="mb-4 text-xl font-bold text-slate-900">New Post</h1>
      <UpdateForm />
    </div>
  );
}
