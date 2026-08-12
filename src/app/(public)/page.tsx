import Link from "next/link";
import {
  getResolvedSettings,
  getFeaturedServices,
  getServices,
  getDoctors,
  getTestimonials,
  getUpdates,
  getGallery,
  getVideos,
} from "@/lib/queries";
import { ServiceCard, DoctorCard, UpdateCard } from "@/components/public/cards";
import { NewsletterForm } from "@/components/public/forms";
import { TrackLink } from "@/components/public/track-link";
import { JsonLd } from "@/components/json-ld";
import { DoctorSlider } from "@/components/public/doctor-slider";
import { LazyMap } from "@/components/public/lazy-map";
import { HomeGallerySlider } from "@/components/public/home-gallery-slider";
import { VideoSlideshow } from "@/components/public/video-slideshow";
import { ShinyText } from "@/components/ui/shiny-text";
import { ManifestoSection } from "@/components/public/manifesto-section";
import { WhyUsBento } from "@/components/public/why-us-bento";

import { telHref, whatsappHref } from "@/lib/constants";
import Image from "next/image";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TestimonialsSection } from "@/components/public/testimonials-demo";
import { AnimatedTitle } from "@/components/ui/animated-title";
import RotatingText from "@/components/ui/RotatingText";
import ShapeGrid from "@/components/ui/ShapeGrid";
import { HeroBookAppointmentButton } from "@/components/public/hero-book-appointment-button";
import { HeroPatientStoriesButton } from "@/components/public/hero-patient-stories-button";
import { HeroVideo } from "@/components/public/hero-video";
import { getCanonicalUrl } from "@/lib/utils";
import SpotlightCanvas from "@/components/ui/spotlight-canvas";



export const metadata = {
  title: "Best Physiotherapist in Ahmedabad | Dr Physio",
  description: "Expert physiotherapy, sports injury rehab, and child development in Bopal, Ahmedabad. Book your appointment with Dr Jeetendra Brahmbhatt today.",
  alternates: { canonical: getCanonicalUrl("/") },
};

export const revalidate = 3600;

export default async function HomePage() {
  const [settings, featured, allServices, doctors, testimonials, updates, gallery, videos] =
    await Promise.all([
      getResolvedSettings(),
      getFeaturedServices(6),
      getServices(),
      getDoctors(true),
      getTestimonials(true),
      getUpdates(),
      getGallery(true),
      getVideos(),
    ]);

  const services = featured.length ? featured : allServices.slice(0, 6);
  const leadDoctor = doctors[0];
  const testimonialVideos = videos.filter(v => v.category?.toLowerCase().trim().includes("testimonial"));

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100dvh] items-center bg-[#17153f] pt-16 text-white pb-12 overflow-hidden">
        
        {/* Spotlight Overlay */}
        <SpotlightCanvas config={{ glowColor: '176, 165, 210', spotlightIntensity: 0.5, spotlightSize: 300, fadeSpeed: 0.8 }} />
        {/* Threads Background Spanning Entire Section */}
        <div 
          className="absolute inset-0 z-0 opacity-10 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 35%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 35%)'
          }}
        >
          <ShapeGrid
            speed={0}
            squareSize={80}
            hoverFillColor="transparent"
            hoverTrailAmount={0}
            borderColor="#e2e8f0"
            lineWidth={0.4}
          />
        </div>

        <div className="w-full px-6 lg:px-12 grid gap-8 lg:grid-cols-2 relative z-10 pointer-events-none">
          <div className="flex flex-col justify-start xl:pl-8 pt-12 md:pt-16 lg:pt-20">
            <h1 className="flex flex-col gap-2">
              <div className="font-outfit text-6xl sm:text-7xl lg:text-[85px] xl:text-[95px] leading-[0.9] font-medium tracking-tight text-white mb-2">
                Top-rated <br />
                <span className="font-playfair italic font-normal">physiotherapy</span> <br />
                in <br />
                Ahmedabad.
              </div>
              <ShinyText 
                text="Dr Physio" 
                speed={3}
                delay={0}
                color="#ef4444"
                shineColor="#970000"
                spread={70}
                direction="left"
                yoyo={false}
                pauseOnHover={false}
                className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
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
            <div className="mt-12 sm:mt-16 flex flex-wrap items-center gap-6 pointer-events-auto relative">
              <HeroBookAppointmentButton />
              
              {/* Watch Patient Stories Button */}
              <HeroPatientStoriesButton />
            </div>
          </div>
          {/* Video Container Column */}
          <div className="hidden lg:flex flex-col justify-center items-end pointer-events-auto pt-16 xl:pt-24">
            <HeroVideo />
            
            {/* Quote placed naturally below the video */}
            <div className="w-full max-w-[480px] mt-10 pr-4">
              <p className="font-playfair italic text-2xl lg:text-[28px] text-white/95 leading-snug">
                “We do not fix people, <br className="hidden xl:block"/> we give the body its listening back.”
              </p>
              <p className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/60 mt-5 font-semibold font-outfit text-right">
                — Dr. Jeetendra Brahmbhatt · Lead
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence Stats */}
      <section className="bg-white py-16 lg:py-24 border-y border-slate-200">
        <div className="container-page max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-4 text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase mb-12">
            <span>01 — EVIDENCE</span>
            <div className="flex-grow h-px bg-[#0b081c]"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-y-12 md:grid-cols-4 md:gap-y-0">
            {/* Stat 1 */}
            <div className="border-l border-[#0b081c] pl-5 md:pl-6 lg:pl-8 flex flex-col justify-center text-left">
              <div className="text-3xl md:text-4xl lg:text-5xl font-light mb-3 text-[#0b081c] whitespace-nowrap">
                <AnimatedCounter value={13} suffix="+" />
              </div>
              <div className="text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase mb-1.5">
                Years of Practice
              </div>
              <div className="text-sm text-slate-500 font-light">
                Since 2011
              </div>
            </div>

            {/* Stat 2 */}
            <div className="border-l border-[#0b081c] pl-5 md:pl-6 lg:pl-8 flex flex-col justify-center overflow-hidden text-left">
              <div className="text-3xl md:text-4xl lg:text-5xl font-light mb-3 text-[#0b081c] whitespace-nowrap">
                <AnimatedCounter value={250000} suffix="+" />
              </div>
              <div className="text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase mb-1.5 truncate">
                Patients Treated
              </div>
              <div className="text-sm text-slate-500 font-light truncate">
                Bopal &middot; Ahmedabad
              </div>
            </div>

            {/* Stat 3 */}
            <div className="border-l border-[#0b081c] pl-5 md:pl-6 lg:pl-8 flex flex-col justify-center overflow-hidden text-left">
              <div className="text-3xl md:text-4xl lg:text-5xl font-light mb-3 text-[#0b081c] flex items-center whitespace-nowrap">
                <AnimatedCounter value={4.9} decimals={1} />
                <svg className="w-6 h-6 lg:w-8 lg:h-8 ml-2 text-[#0b081c] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase mb-1.5 truncate">
                Patient Rating
              </div>
              <div className="text-sm text-slate-500 font-light truncate">
                Across 590+ Google reviews
              </div>
            </div>

            {/* Stat 4 */}
            <div className="border-l border-[#0b081c] pl-5 md:pl-6 lg:pl-8 flex flex-col justify-center overflow-hidden text-left">
              <div className="text-3xl md:text-4xl lg:text-5xl font-light mb-3 text-[#0b081c] whitespace-nowrap">
                <AnimatedCounter value={24} suffix="h" />
              </div>
              <div className="text-[10px] font-semibold tracking-[0.15em] text-slate-500 uppercase mb-1.5 truncate">
                Same-Day Slots
              </div>
              <div className="text-sm text-slate-500 font-light truncate">
                Priority urgent care
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <ManifestoSection />

      {/* Why Us Bento */}
      <WhyUsBento />

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



      {/* Gallery preview */}
      {gallery.length > 0 && (
        <Section title="What does our clinic look like?" href="/gallery" linkLabel="View gallery" muted>
          <HomeGallerySlider gallery={gallery} />
        </Section>
      )}

      {/* Updates preview */}
      {updates.length > 0 && (
        <Section title="Latest Updates" href="/updates" linkLabel="All updates">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {updates.slice(0, 3).map((u) => (
              <UpdateCard key={u.id} update={u} redirectToList={true} />
            ))}
          </div>
        </Section>
      )}

      {/* Testimonials Component */}
      <TestimonialsSection testimonials={testimonials} />

      {/* Testimonial Videos */}
      {testimonialVideos.length > 0 && (
        <section id="testimonials" className="bg-slate-50 py-12 scroll-mt-20">
          <div className="container-page">
            <div className="mb-8 flex flex-col items-center text-center">
              <h2 className="section-title mb-4">Patient Stories in Video</h2>
              <p className="max-w-2xl text-slate-600">
                Hear directly from our patients about their experiences and successful recoveries.
              </p>
            </div>
            <VideoSlideshow videos={testimonialVideos} />
          </div>
        </section>
      )}

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
          <Link href={href} className="shrink-0 mb-1 text-sm font-semibold text-brand-600 hover:text-red-600 transition-colors">
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
