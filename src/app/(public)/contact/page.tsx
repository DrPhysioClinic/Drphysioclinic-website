import type { Metadata } from "next";
import { getResolvedSettings, getServices } from "@/lib/queries";
import { AppointmentForm, EnquiryForm } from "@/components/public/forms";
import { TrackLink } from "@/components/public/track-link";
import { telHref, whatsappHref } from "@/lib/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact & Book Appointment",
  description:
    "Book an appointment or send an enquiry to Dr Physio, Bopal, Ahmedabad. Address, phone and directions.",
};

export default async function ContactPage() {
  const [settings, services] = await Promise.all([getResolvedSettings(), getServices()]);
  const directionsUrl =
    settings.google_maps_url ||
    `https://www.google.com/maps/dir/?api=1&destination=${settings.latitude},${settings.longitude}`;

  return (
    <div className="container-page py-12">
      <h1 className="section-title">Contact Us</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Book an appointment, send an enquiry, or visit us in Bopal, Ahmedabad.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Contact info + map */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900">Clinic Details</h2>
            <p className="mt-2 text-sm text-slate-600">{settings.address}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <TrackLink
                href={telHref(settings.phone_primary)}
                eventType="call_click"
                sourcePage="/contact"
                className="btn-primary"
              >
                📞 {settings.phone_primary}
              </TrackLink>
              <TrackLink
                href={whatsappHref(settings.whatsapp_number, "Hi, I'd like to book an appointment.")}
                eventType="whatsapp_click"
                sourcePage="/contact"
                external
                className="btn-outline"
              >
                💬 WhatsApp
              </TrackLink>
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Get Directions →
            </a>
          </div>

          <div className="relative h-72 overflow-hidden rounded-xl">
            <iframe
              title="Clinic location"
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${settings.latitude},${settings.longitude}&z=15&output=embed`}
            />
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-900">Quick Enquiry</h2>
            <p className="mb-3 text-sm text-slate-600">Have a question? Send us a message.</p>
            <EnquiryForm sourcePage="/contact" />
          </div>
        </div>

        {/* Appointment form */}
        <div id="appointment" className="card p-6">
          <h2 className="text-lg font-bold text-slate-900">Book an Appointment</h2>
          <p className="mb-4 text-sm text-slate-600">
            Fill in your details and we&apos;ll call to confirm. Payment is collected at the clinic
            (Cash / UPI / Card) — no online payment.
          </p>
          <AppointmentForm
            services={services.map((s) => ({ id: s.id, title: s.title }))}
            sourcePage="/contact"
          />
        </div>
      </div>
    </div>
  );
}
