import Image from "next/image";
import Link from "next/link";
import { YouTubeEmbed } from "@/components/public/youtube-embed";
import type { Doctor, Service, Testimonial, Update, Video } from "@/types/database";

const PLACEHOLDER = "https://placehold.co/600x400/eefcf9/157f76?text=Dr+Physio";

import {
  CutoutCard,
  CutoutCardMedia,
  CutoutCardImage,
  CutoutCardContent,
  CutoutCardAction,
  CutoutCardPin,
  CutoutCorner,
  cutoutCardSurfaceClassName,
} from "@/components/ui/cutout-card";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/treatments/${service.slug}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[28px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md">
      <CutoutCard className={`${cutoutCardSurfaceClassName} h-full flex flex-col isolate bg-white`}>
        <CutoutCardMedia className="relative h-48 w-full shrink-0">
          <CutoutCardImage
            src={service.hero_image_url || PLACEHOLDER}
            alt={service.title || "Treatment"}
          />
          {service.price != null && (
            <CutoutCardPin className="top-0 right-0 z-20 flex bg-card rounded-bl-2xl p-2 pl-3 pb-2">
              <span className="font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-md text-sm border border-brand-100">
                ₹{service.price}
                {service.old_price != null && (
                  <span className="ml-1 text-xs text-slate-400 line-through">₹{service.old_price}</span>
                )}
              </span>
              <CutoutCorner className="absolute -left-[16px] top-0 text-card -scale-y-100" size={16} />
              <CutoutCorner className="absolute bottom-[-16px] right-0 text-card -scale-y-100" size={16} />
            </CutoutCardPin>
          )}
        </CutoutCardMedia>
        <CutoutCardContent className="flex flex-col isolate flex-1 pb-16">
          {service.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-600 mb-1">
              {service.category.replace(/#/g, "").trim()}
            </span>
          )}
          <h3 className="font-semibold text-slate-900 line-clamp-2">{service.title}</h3>
          {service.short_description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600 flex-1">{service.short_description}</p>
          )}
        </CutoutCardContent>
        <CutoutCardAction className="absolute bottom-4 right-4 z-10" revealOnHover={true}>
          <span className="flex items-center gap-1 rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_15px_rgba(43,39,117,0.6)] transition-all hover:bg-brand-700 hover:shadow-[0_0_25px_rgba(43,39,117,0.8)]">
            Read More <span aria-hidden="true">&rarr;</span>
          </span>
        </CutoutCardAction>
      </CutoutCard>
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
            {testimonial.treatment_category.replace(/#/g, "").trim()}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export function UpdateCard({ update }: { update: Update }) {
  return (
    <Link href={`/updates/${update.slug}`} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-[28px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md">
      <CutoutCard className={`${cutoutCardSurfaceClassName} h-full flex flex-col isolate bg-white`}>
        <CutoutCardMedia className="relative aspect-[16/9] w-full shrink-0">
          <CutoutCardImage
            src={update.image_url || PLACEHOLDER}
            alt={update.title || "Update"}
          />
          {update.published_at && (
            <CutoutCardPin className="top-0 right-0 z-20 flex bg-card rounded-bl-2xl p-2 pl-3 pb-2">
              <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-1 rounded-md text-xs border border-brand-100">
                {new Date(update.published_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <CutoutCorner className="absolute -left-[16px] top-0 text-card -scale-y-100" size={16} />
              <CutoutCorner className="absolute bottom-[-16px] right-0 text-card -scale-y-100" size={16} />
            </CutoutCardPin>
          )}
        </CutoutCardMedia>
        <CutoutCardContent className="flex flex-col isolate flex-1 pb-16">
          <h3 className="font-semibold text-slate-900 line-clamp-2">{update.title}</h3>
          {update.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600 flex-1">{update.excerpt}</p>
          )}
        </CutoutCardContent>
        <CutoutCardAction className="absolute bottom-4 right-4 z-10" revealOnHover={true}>
          <span className="flex items-center gap-1 rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_15px_rgba(43,39,117,0.6)] transition-all hover:bg-brand-700 hover:shadow-[0_0_25px_rgba(43,39,117,0.8)]">
            Read More <span aria-hidden="true">&rarr;</span>
          </span>
        </CutoutCardAction>
      </CutoutCard>
    </Link>
  );
}

export function VideoCard({ video }: { video: Video }) {
  return (
    <div className="card group overflow-hidden transition-shadow hover:shadow-md flex flex-col isolate h-full">
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
