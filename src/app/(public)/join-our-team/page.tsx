import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/utils";
import { IconHeartHandshake, IconExternalLink } from "@tabler/icons-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Join Our Team | Careers at Dr. Physio Clinic Bopal, Ahmedabad",
  description:
    "Career opportunities for physiotherapists at Dr. Physio Clinic in Bopal, Ahmedabad. Apply to work in sports rehabilitation, orthopedics, pediatric physiotherapy, and personal fitness.",
  alternates: { canonical: getCanonicalUrl("/join-our-team") },
};

export default function JoinOurTeamPage() {
  const formUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLSd1VsXx5X67hjcb_9VCb9b9z0buZ2gYggMro4KbuGWhN_vJ1g/viewform?usp=dialog";
  const embedUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLSd1VsXx5X67hjcb_9VCb9b9z0buZ2gYggMro4KbuGWhN_vJ1g/viewform?embedded=true";

  return (
    <div className="container-page pt-28 pb-16">
      {/* Header Banner - Clean and focused for Physiotherapists */}
      <div className="mx-auto max-w-2xl text-center mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 mb-4 shadow-xs">
          <IconHeartHandshake className="w-4 h-4 text-brand-600" />
          Careers at Dr. Physio Clinic
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 font-outfit">
          Join Our <span className="font-playfair italic font-normal text-brand-600">Team</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          We are looking for dedicated, passionate physiotherapists to join our clinical practice in Bopal, Ahmedabad. Fill in your details below to apply directly.
        </p>
      </div>

      {/* Embedded Google Form Card */}
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl border border-slate-200 bg-white p-2 sm:p-6 shadow-sm overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full border-0 rounded-xl min-h-[850px] sm:min-h-[950px]"
            title="Join Our Team Application Form"
            loading="lazy"
          >
            Loading application form…
          </iframe>
        </div>

        {/* Fallback link if needed */}
        <div className="mt-4 text-center">
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 transition-colors"
          >
            <span>Having trouble viewing the form? Open in a new tab</span>
            <IconExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
