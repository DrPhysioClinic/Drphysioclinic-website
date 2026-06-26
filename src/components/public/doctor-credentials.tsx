import type { Doctor } from "@/types/database";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="text-slate-800">{value}</dd>
    </div>
  );
}

export function DoctorCredentials({ doctor }: { doctor: Doctor }) {
  const hasExperience = doctor.experience_years != null;
  const hasEducation = Boolean(doctor.education);
  const hasMemberships = Boolean(doctor.memberships);
  const hasRegistration = Boolean(doctor.registration_no);

  if (!hasExperience && !hasEducation && !hasMemberships && !hasRegistration) {
    return null;
  }

  return (
    <dl className="mt-5 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
      {hasExperience && (
        <Detail label="Experience" value={`${doctor.experience_years} years`} />
      )}
      {hasEducation && <Detail label="Education" value={doctor.education!} />}
      {hasMemberships && <Detail label="Memberships" value={doctor.memberships!} />}
      {hasRegistration && (
        <Detail label="Registration" value={doctor.registration_no!} />
      )}
    </dl>
  );
}
