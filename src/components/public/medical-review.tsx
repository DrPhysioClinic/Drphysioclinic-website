import Link from "next/link";
import type { Doctor } from "@/types/database";

export function MedicalReview({ 
  reviewer, 
  reviewedAt 
}: { 
  reviewer?: Doctor | null; 
  reviewedAt?: string | null 
}) {
  if (!reviewer) return null;

  const credential = reviewer.education || reviewer.registration_no;
  
  return (
    <div className="mt-1 text-sm text-slate-600 flex items-center gap-1.5 flex-wrap">
      <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
      </svg>
      <span>
        Medically reviewed by{" "}
        <Link href={`/doctors/${reviewer.slug}`} className="font-medium text-brand-600 hover:underline">
          {reviewer.name}
        </Link>
        {credential && <span className="text-slate-500">, {credential}</span>}
        {reviewedAt && (
          <>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="text-slate-500">
              {new Date(reviewedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </span>
          </>
        )}
      </span>
    </div>
  );
}
