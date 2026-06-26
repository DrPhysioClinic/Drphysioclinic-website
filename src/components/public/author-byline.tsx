import Link from "next/link";
import type { Doctor } from "@/types/database";

export function AuthorByline({ author }: { author?: Doctor | null }) {
  if (!author) return null;

  const credential = author.education || author.registration_no;
  
  return (
    <div className="mt-2 text-sm text-slate-600">
      Written by{" "}
      <Link href={`/doctors/${author.slug}`} className="font-medium text-brand-600 hover:underline">
        {author.name}
      </Link>
      {credential && <span className="text-slate-500">, {credential}</span>}
    </div>
  );
}
