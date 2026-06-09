import { UpdateForm } from "@/components/admin/forms/update-form";

export const dynamic = "force-dynamic";

export default function NewUpdatePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-slate-900">New Post</h1>
      <UpdateForm />
    </div>
  );
}
