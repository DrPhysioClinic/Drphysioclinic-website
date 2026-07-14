import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/utils";
import { getResolvedSettings, getServices } from "@/lib/queries";
import { LazyMap } from "@/components/public/lazy-map";
import { AppointmentForm, EnquiryForm } from "@/components/public/forms";
import { TrackLink } from "@/components/public/track-link";
import { telHref, whatsappHref } from "@/lib/constants";
import { Phone, MessageCircle } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact Our Bopal Physiotherapy Clinic",
  description:
    "Book your appointment at Dr Physio in Bopal, Ahmedabad. Get directions to our Amrapali Axiom Complex clinic, call us, or request a home visit today.",
  alternates: { canonical: getCanonicalUrl("/contact") },
};

export default async function ContactPage() {
  const [settings, services] = await Promise.all([getResolvedSettings(), getServices()]);
  const directionsUrl =
    settings.google_maps_url ||
    `https://www.google.com/maps/dir/?api=1&destination=${settings.latitude},${settings.longitude}`;

  return (
    <div className="container-page pt-28 pb-12">
      <h1 className="section-title">Let's Map Your Next Move</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Book an appointment, send an enquiry, or visit us in Bopal, Ahmedabad.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Contact info + map */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-lg">How to Reach Our Bopal Clinic</h2>
            <p className="mt-2 text-sm text-slate-600">{settings.address}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <TrackLink
                href={telHref(settings.phone_primary)}
                eventType="call_click"
                sourcePage="/contact"
                className="btn-primary"
              >
                <Phone className="h-4 w-4" />
                {settings.phone_primary}
              </TrackLink>
              <TrackLink
                href={whatsappHref(settings.whatsapp_number, "Hi, I'd like to book an appointment.")}
                eventType="whatsapp_click"
                sourcePage="/contact"
                external
                className="btn-outline"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </TrackLink>
            </div>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-3 inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-400 transition-colors"
            >
              Get Directions
              <span className="ml-1 transition-transform duration-300 group-hover:rotate-90">
                →
              </span>
            </a>
          </div>

          <div className="relative h-72 overflow-hidden rounded-xl">
            <LazyMap latitude={settings.latitude} longitude={settings.longitude} />
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
            Fill in your details and we&apos;ll call to confirm.
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
