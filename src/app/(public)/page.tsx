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
import { ServiceCard, DoctorCard, UpdateCard } from "@/components/public/cards";
import { NewsletterForm } from "@/components/public/forms";
import { TrackLink } from "@/components/public/track-link";
import { JsonLd } from "@/components/json-ld";
import { DoctorSlider } from "@/components/public/doctor-slider";
import { LazyMap } from "@/components/public/lazy-map";

import { telHref, whatsappHref } from "@/lib/constants";
import Image from "next/image";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TestimonialsSection } from "@/components/public/testimonials-demo";
import { AnimatedTitle } from "@/components/ui/animated-title";
import RotatingText from "@/components/ui/RotatingText";
import Threads from "@/components/ui/Threads";
import { HeroVisibilityTracker } from "@/components/public/hero-visibility-tracker";
import { HeroBookAppointmentButton } from "@/components/public/hero-book-appointment-button";
import { HeroVideo } from "@/components/public/hero-video";
import { getCanonicalUrl } from "@/lib/utils";



export const metadata = {
  title: "Best Physiotherapist in Ahmedabad | Dr Physio",
  description: "Expert physiotherapy, sports injury rehab, and child development in Bopal, Ahmedabad. Book your appointment with Dr Jeetendra Brahmbhatt today.",
  alternates: { canonical: getCanonicalUrl("/") },
};

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
      getGallery(true),
    ]);

  const services = featured.length ? featured : allServices.slice(0, 6);
  const leadDoctor = doctors[0];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100dvh] items-center bg-[#17153f] pt-16 text-white pb-12 overflow-hidden">
        
        {/* Threads Background Spanning Entire Section */}
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
          <Threads
            amplitude={2}
            distance={0.3}
            enableMouseInteraction={false}
          />
        </div>

        <div className="container-page grid w-full gap-8 lg:grid-cols-2 relative z-10 pointer-events-none">
          <div className="flex flex-col justify-center">
            <h1 className="flex flex-col gap-2">
              <span className="text-sm font-semibold tracking-wider text-brand-300 uppercase">Top-Rated Physiotherapy Clinic in Ahmedabad</span>
              <AnimatedTitle 
                text="Dr Physio" 
                as="span" 
                className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl" 
              />
            </h1>
            <div className="mt-6 sm:mt-8 w-full max-w-2xl">
              <div className="flex flex-wrap items-center text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                <RotatingText
                  texts={[
                    "Physiotherapy",
                    "Sports and Injury Clinic",
                    "Fitness studio",
                    "Child development centre"
                  ]}
                  mainClassName="px-5 sm:px-6 bg-brand-400 text-white overflow-hidden py-2 sm:py-3 rounded-2xl shadow-2xl shadow-brand-400/40 border border-brand-300/20"
                  staggerFrom="first"
                  initial={{ y: "200%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-200%", opacity: 0 }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-1 sm:pb-2"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                  animatePresenceMode="popLayout"
                />
              </div>
            </div>
            <div className="mt-24 sm:mt-32 flex flex-wrap gap-3 pointer-events-auto h-[44px] relative">
              <HeroVisibilityTracker />
              <HeroBookAppointmentButton />
            </div>
          </div>
          {/* Video Container Column */}
          <div className="hidden lg:flex items-center justify-end pointer-events-auto">
            <HeroVideo />
          </div>
        </div>
      </section>

      {/* Trust stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-10 text-center sm:grid-cols-4">
          {[
            { value: leadDoctor?.experience_years ?? 13, suffix: "+", label: "Years Experience" },
            { value: allServices.length || 8, suffix: "+", label: "Treatments" },
            { value: 250000, suffix: "+", label: "Happy Patients" },
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

      {/* AEO Why Choose Us */}
      <section className="bg-slate-50 py-12">
        <div className="container-page">
          <h2 className="section-title text-center mb-8">Why Choose Dr Physio in Bopal?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="font-bold text-lg text-brand-700 mb-2">Expert Care</h3>
              <p className="text-slate-600">Led by Dr. Jeetendra Brahmbhatt with 13+ years of experience in advanced physiotherapy.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="font-bold text-lg text-brand-700 mb-2">Advanced Facilities</h3>
              <p className="text-slate-600">State-of-the-art rehab center equipped for sports injuries, neuro, and ortho conditions.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
              <h3 className="font-bold text-lg text-brand-700 mb-2">Highest Rated</h3>
              <p className="text-slate-600">Trusted by thousands with 590+ 5-star Google reviews from happy patients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <Section title="What conditions do we treat?" href="/treatments" linkLabel="View all">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, idx) => (
            <ServiceCard key={s.id} service={s} hidePrice={true} redirectToList={true} className={idx >= 4 ? "hidden sm:block" : ""} />
          ))}
          {services.length === 0 && <EmptyNote label="treatments" />}
        </div>
      </Section>

      {/* Doctors preview */}
      <DoctorSlider doctors={doctors} />



      {/* Updates preview */}
      {updates.length > 0 && (
        <Section title="Latest Updates" href="/updates" linkLabel="All updates" muted>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {updates.slice(0, 3).map((u) => (
              <UpdateCard key={u.id} update={u} redirectToList={true} />
            ))}
          </div>
        </Section>
      )}

      {/* Gallery preview */}
      {gallery.length > 0 && (
        <Section title="What does our clinic look like?" href="/gallery" linkLabel="View gallery">
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
      <TestimonialsSection testimonials={testimonials} />

      {/* Contact / location + newsletter */}
      <section className="bg-slate-50">
        <div className="container-page grid gap-8 py-14 lg:grid-cols-2">
          <div>
            <AnimatedTitle text="Visit Us" className="section-title" />
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
            <LazyMap latitude={settings.latitude} longitude={settings.longitude} />
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
        <div className="mb-6 flex items-end justify-between gap-4">
          <AnimatedTitle text={title} className="section-title" />
          <Link href={href} className="shrink-0 mb-1 text-sm font-semibold text-brand-600 hover:text-brand-400 transition-colors">
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
