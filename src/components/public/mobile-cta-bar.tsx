import Link from "next/link";
import { telHref, whatsappHref } from "@/lib/constants";
import { TrackLink } from "@/components/public/track-link";

/** Sticky bottom bar on mobile: Call · WhatsApp · Book Appointment. */
export function MobileCtaBar({
  phone,
  whatsappNumber,
}: {
  phone?: string | null;
  whatsappNumber?: string | null;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden">
      <TrackLink
        href={telHref(phone)}
        eventType="call_click"
        sourcePage="mobile_cta_bar"
        ariaLabel="Call the clinic"
        className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-semibold text-brand-700"
      >
        <span aria-hidden>📞</span>
        Call
      </TrackLink>
      <TrackLink
        href={whatsappHref(whatsappNumber, "Hi, I'd like to book an appointment.")}
        eventType="whatsapp_click"
        sourcePage="mobile_cta_bar"
        ariaLabel="Message on WhatsApp"
        external
        className="flex flex-col items-center justify-center gap-0.5 border-x border-slate-200 py-2.5 text-xs font-semibold text-[#1ba14f]"
      >
        <span aria-hidden>💬</span>
        WhatsApp
      </TrackLink>
      <Link
        href="/contact#appointment"
        className="flex flex-col items-center justify-center gap-0.5 bg-accent-500 py-2.5 text-xs font-semibold text-white"
      >
        <span aria-hidden>📅</span>
        Book
      </Link>
    </div>
  );
}
