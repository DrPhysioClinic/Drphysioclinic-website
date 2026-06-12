import Link from "next/link";
import {
  getResolvedSettings,
  getFeaturedServices,
  getServices,
  getDoctors,
  getTestimonials,
  getUpdates,
  getGallery,
} from "@/lib/queries";
import { ServiceCard, DoctorCard, TestimonialCard, UpdateCard } from "@/components/public/cards";
import { NewsletterForm } from "@/components/public/forms";
import { TrackLink } from "@/components/public/track-link";
import { JsonLd } from "@/components/json-ld";
import { clinicJsonLd } from "@/lib/seo";
import { telHref, whatsappHref } from "@/lib/constants";
import Image from "next/image";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TestimonialsSection } from "@/components/public/testimonials-demo";

export const revalidate = 3600;

export default async function HomePage() {
  const [settings, featured, allServices, doctors, testimonials, updates, gallery] =
    await Promise.all([
      getResolvedSettings(),
      getFeaturedServices(6),
      getServices(),
      getDoctors(true),
      getTestimonials(true),
      getUpdates(),
      getGallery(),
    ]);

  const services = featured.length ? featured : allServices.slice(0, 6);
  const leadDoctor = doctors[0];

  return (
    <>
      <JsonLd data={clinicJsonLd(settings, settings.logo_url)} />

      {/* Hero */}
      <section className="relative flex min-h-[100dvh] items-center bg-[#17153f] pt-16 text-white pb-12">
        <div className="container-page grid w-full gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {settings.clinic_name}
            </h1>
            <p className="mt-4 max-w-xl text-brand-100">{settings.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact#appointment" className="btn-accent">
                Book Appointment
              </Link>
              <TrackLink
                href={telHref(settings.phone_primary)}
                eventType="call_click"
                sourcePage="home_hero"
                className="btn bg-white text-brand-700 hover:bg-brand-50"
              >
                📞 {settings.phone_primary}
              </TrackLink>
              <TrackLink
                href={whatsappHref(settings.whatsapp_number, "Hi, I'd like to book an appointment.")}
                eventType="whatsapp_click"
                sourcePage="home_hero"
                external
                className="btn border border-white/40 text-white hover:bg-white/10"
              >
                💬 WhatsApp
              </TrackLink>
            </div>
          </div>
          <div className="relative hidden min-h-[400px] overflow-hidden rounded-2xl lg:block">
            <Image
              src="https://placehold.co/800x600/157f76/ffffff?text=Dr+Physio+Clinic"
              alt="Physiotherapy clinic"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Trust stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-10 text-center sm:grid-cols-4">
          {[
            { value: leadDoctor?.experience_years ?? 13, suffix: "+", label: "Years Experience" },
            { value: allServices.length || 8, suffix: "+", label: "Treatments" },
            { value: 50000, suffix: "+", label: "Happy Patients" },
            { value: 4.9, suffix: "★", decimals: 1, label: "Patient Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-brand-700 sm:text-3xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
              </div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services preview */}
      <Section title="Our Treatments" href="/treatments" linkLabel="View all treatments">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
          {services.length === 0 && <EmptyNote label="treatments" />}
        </div>
      </Section>

      {/* Doctors preview */}
      <Section title="Meet Our Doctors" href="/doctors" linkLabel="All doctors" muted>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
          {doctors.length === 0 && <EmptyNote label="doctors" />}
        </div>
      </Section>

      {/* Testimonials preview */}
      {testimonials.length > 0 && (
        <Section title="What Our Patients Say" href="/testimonials" linkLabel="More reviews">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </Section>
      )}

      {/* Updates preview */}
      {updates.length > 0 && (
        <Section title="Latest Updates" href="/updates" linkLabel="All updates" muted>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {updates.slice(0, 3).map((u) => (
              <UpdateCard key={u.id} update={u} />
            ))}
          </div>
        </Section>
      )}

      {/* Gallery preview */}
      {gallery.length > 0 && (
        <Section title="Clinic Gallery" href="/gallery" linkLabel="View gallery">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.slice(0, 8).map((g) => (
              <div
                key={g.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-brand-50"
              >
                <Image
                  src={g.image_url}
                  alt={g.alt_text || g.title || "Gallery image"}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Testimonials Component */}
      <TestimonialsSection />

      {/* Contact / location + newsletter */}
      <section className="bg-slate-50">
        <div className="container-page grid gap-8 py-14 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Visit Us</h2>
            <p className="mt-3 text-slate-600">{settings.address}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                <a className="text-brand-700" href={telHref(settings.phone_primary)}>
                  {settings.phone_primary}
                </a>
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                <a className="text-brand-700" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              </p>
            </div>
            <Link href="/contact" className="btn-primary mt-5">
              Contact &amp; Directions
            </Link>
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">Subscribe to updates</h3>
              <p className="mb-3 text-sm text-slate-600">Health tips and clinic news. No spam.</p>
              <NewsletterForm sourcePage="/" />
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden rounded-xl">
            <iframe
              title="Clinic location"
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${settings.latitude},${settings.longitude}&z=15&output=embed`}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Section({
  title,
  href,
  linkLabel,
  muted,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={muted ? "bg-slate-50" : "bg-white"}>
      <div className="container-page py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="section-title">{title}</h2>
          <Link href={href} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            {linkLabel} →
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}

function EmptyNote({ label }: { label: string }) {
  return (
    <p className="col-span-full rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      No {label} published yet. Add some from the admin portal.
    </p>
  );
}
