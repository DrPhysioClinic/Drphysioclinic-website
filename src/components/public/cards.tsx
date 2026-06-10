import Image from "next/image";
import Link from "next/link";
import { YouTubeEmbed } from "@/components/public/youtube-embed";
import type { Doctor, Service, Testimonial, Update, Video } from "@/types/database";

const PLACEHOLDER = "https://placehold.co/600x400/eefcf9/157f76?text=Dr+Physio";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/treatments/${service.slug}`}
      className="card group overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-brand-50">
        <Image
          src={service.hero_image_url || PLACEHOLDER}
          alt={service.title || "Treatment"}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        {service.category && (
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {service.category}
          </span>
        )}
        <h3 className="mt-1 font-semibold text-slate-900">{service.title}</h3>
        {service.short_description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{service.short_description}</p>
        )}
        {service.price != null && (
          <div className="mt-2 flex items-center gap-2">
            <span className="font-bold text-brand-700">₹{service.price}</span>
            {service.old_price != null && (
              <span className="text-sm text-slate-400 line-through">₹{service.old_price}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Link href={`/doctors/${doctor.slug}`} className="card group overflow-hidden text-center">
      <div className="relative mx-auto mt-5 h-28 w-28 overflow-hidden rounded-full bg-brand-50">
        <Image
          src={doctor.image_url || "https://placehold.co/200x200/eefcf9/157f76?text=Dr"}
          alt={doctor.name || "Doctor"}
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900">{doctor.name}</h3>
        <p className="text-sm text-brand-600">{doctor.title}</p>
        {doctor.specialization && (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{doctor.specialization}</p>
        )}
      </div>
    </Link>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="card flex h-full flex-col p-5">
      <div className="text-accent-500" aria-label={`${testimonial.rating ?? 5} star rating`}>
        {"★".repeat(testimonial.rating ?? 5)}
        <span className="text-slate-300">{"★".repeat(5 - (testimonial.rating ?? 5))}</span>
      </div>
      <blockquote className="mt-2 flex-1 text-sm text-slate-700">
        “{testimonial.testimonial}”
      </blockquote>
      <figcaption className="mt-4 text-sm font-semibold text-slate-900">
        {testimonial.patient_name}
        {testimonial.treatment_category && (
          <span className="block text-xs font-normal text-slate-500">
            {testimonial.treatment_category}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export function UpdateCard({ update }: { update: Update }) {
  return (
    <Link
      href={`/updates/${update.slug}`}
      className="card group overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-50">
        <Image
          src={update.image_url || PLACEHOLDER}
          alt={update.title || "Update"}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900">{update.title}</h3>
        {update.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{update.excerpt}</p>
        )}
        {update.published_at && (
          <p className="mt-2 text-xs text-slate-400">
            {new Date(update.published_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </Link>
  );
}

export function VideoCard({ video }: { video: Video }) {
  return (
    <div className="card group overflow-hidden transition-shadow hover:shadow-md flex flex-col h-full">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900 shrink-0">
        <YouTubeEmbed
          videoId={video.video_url || ""}
          title={video.title || undefined}
          thumbnailUrl={video.thumbnail_url}
        />
      </div>
      <div className="p-4 flex-1">
        <h3 className="font-semibold text-slate-900">{video.title}</h3>
        {video.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{video.description}</p>
        )}
      </div>
    </div>
  );
}
