import { InfoPageForm } from "@/components/admin/forms/info-page-form";

export const dynamic = "force-dynamic";

export default function NewInfoPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-slate-900">New Info Page</h1>
      <InfoPageForm />
    </div>
  );
}
