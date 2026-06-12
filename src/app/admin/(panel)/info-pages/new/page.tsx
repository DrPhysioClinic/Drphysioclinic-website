import Link from "next/link";
import { InfoPageForm } from "@/components/admin/forms/info-page-form";

export const dynamic = "force-dynamic";

export default function NewInfoPage() {
  return (
    <div className="max-w-3xl">
      <Link href="/admin/info-pages" className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-brand-600">← Back to Info Pages</Link>
      <h1 className="mb-4 text-xl font-bold text-slate-900">New Info Page</h1>
      <InfoPageForm />
    </div>
  );
}
