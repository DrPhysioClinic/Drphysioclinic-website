"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitAppointment,
  submitEnquiry,
  subscribeNewsletter,
  type FormState,
} from "@/app/actions/forms";

import { TurnstileWidget } from "@/components/public/turnstile-widget";
import type { Service } from "@/types/database";
import { InputGlow } from "@/components/ui/input-glow";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconGenderBigender,
  IconStethoscope,
  IconCreditCard,
  IconCalendar,
  IconClock,
  IconNote,
  IconMessageCircle,
} from "@tabler/icons-react";

const initialState: FormState = { ok: false, message: "" };

/** Hidden honeypot field — bots fill it, humans never see it. */
function Honeypot() {
  return (
    <div aria-hidden className="absolute left-[-9999px] top-[-9999px]" tabIndex={-1}>
      <label>
        Company
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Submitting…" : label}
    </button>
  );
}

function Notice({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p
      className={`rounded-lg px-3 py-2 text-sm ${
        state.ok ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-700"
      }`}
    >
      {state.message}
    </p>
  );
}

export function AppointmentForm({
  services,
  sourcePage = "/contact",
}: {
  services: Pick<Service, "id" | "title">[];
  sourcePage?: string;
}) {
  const [state, formAction] = useActionState(submitAppointment, initialState);
  return (
    <form action={formAction} className="space-y-6">
      <Honeypot />
      <input type="hidden" name="source_page" value={sourcePage} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="label font-medium text-slate-700" htmlFor="patient_name">
            Full Name <span className="text-brand-600">*</span>
          </label>
          <InputGlow>
            <div className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-[10px]">
              <IconUser className="size-5 text-slate-400 shrink-0" stroke={1.5} />
              <input id="patient_name" name="patient_name" required className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400" placeholder="" />
            </div>
          </InputGlow>
        </div>
        <div className="space-y-1.5">
          <label className="label font-medium text-slate-700" htmlFor="phone">
            Phone <span className="text-brand-600">*</span>
          </label>
          <InputGlow>
            <div className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-[10px]">
              <IconPhone className="size-5 text-slate-400 shrink-0" stroke={1.5} />
              <input id="phone" name="phone" type="tel" required className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400" placeholder="+91 00000 00000" />
            </div>
          </InputGlow>
        </div>
        <div className="space-y-1.5">
          <label className="label font-medium text-slate-700" htmlFor="email">Email</label>
          <InputGlow>
            <div className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-[10px]">
              <IconMail className="size-5 text-slate-400 shrink-0" stroke={1.5} />
              <input id="email" name="email" type="email" className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400" placeholder="john@example.com" />
            </div>
          </InputGlow>
        </div>
        <div className="space-y-1.5">
          <label className="label font-medium text-slate-700" htmlFor="gender">Gender</label>
          <InputGlow>
            <div className="flex items-center gap-3 bg-white px-3 py-2.5 pr-4 rounded-[10px]">
              <IconGenderBigender className="size-5 text-slate-400 shrink-0" stroke={1.5} />
              <select id="gender" name="gender" className="w-full bg-transparent outline-none text-slate-900 cursor-pointer appearance-none">
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </InputGlow>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className="label font-medium text-slate-700" htmlFor="service_id">Service Required</label>
          <InputGlow>
            <div className="flex items-center gap-3 bg-white px-3 py-2.5 pr-4 rounded-[10px]">
              <IconStethoscope className="size-5 text-slate-400 shrink-0" stroke={1.5} />
              <select id="service_id" name="service_id" className="w-full bg-transparent outline-none text-slate-900 cursor-pointer appearance-none">
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </InputGlow>
        </div>
        <div className="space-y-1.5">
          <label className="label font-medium text-slate-700" htmlFor="preferred_date">Preferred Date</label>
          <InputGlow>
            <div className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-[10px]">
              <IconCalendar className="size-5 text-slate-400 shrink-0" stroke={1.5} />
              <input id="preferred_date" name="preferred_date" type="date" className="w-full bg-transparent outline-none text-slate-900" />
            </div>
          </InputGlow>
        </div>
        <div className="space-y-1.5">
          <label className="label font-medium text-slate-700" htmlFor="preferred_time">Preferred Time</label>
          <InputGlow>
            <div className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-[10px]">
              <IconClock className="size-5 text-slate-400 shrink-0" stroke={1.5} />
              <input id="preferred_time" name="preferred_time" type="time" className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400" />
            </div>
          </InputGlow>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="label font-medium text-slate-700" htmlFor="notes">Additional Notes</label>
        <InputGlow>
          <div className="flex items-start gap-3 bg-white px-3 py-3 rounded-[10px]">
            <IconNote className="size-5 text-slate-400 shrink-0 mt-0.5" stroke={1.5} />
            <textarea id="notes" name="notes" rows={3} className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 resize-none" placeholder="Any specific symptoms, pain points, or questions?" />
          </div>
        </InputGlow>
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-600 rounded-lg bg-slate-50 p-4 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
        <input type="checkbox" name="terms_accepted" className="mt-1 flex-shrink-0 cursor-pointer accent-brand-600 size-4" required />
        <span>I agree to be contacted about my appointment and accept the clinic&apos;s terms and privacy policy.</span>
      </label>
      <TurnstileWidget />
      <Notice state={state} />
      <SubmitButton label="Request Appointment" />
    </form>
  );
}

export function EnquiryForm({ sourcePage = "/contact" }: { sourcePage?: string }) {
  const [state, formAction] = useActionState(submitEnquiry, initialState);
  return (
    <form action={formAction} className="space-y-5">
      <Honeypot />
      <input type="hidden" name="source_page" value={sourcePage} />
      <div className="space-y-1.5">
        <label className="label font-medium text-slate-700" htmlFor="enq_name">
          Name <span className="text-brand-600">*</span>
        </label>
        <InputGlow>
          <div className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-[10px]">
            <IconUser className="size-5 text-slate-400 shrink-0" stroke={1.5} />
            <input id="enq_name" name="name" required className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400" placeholder="Your Name" />
          </div>
        </InputGlow>
      </div>
      <div className="space-y-1.5">
        <label className="label font-medium text-slate-700" htmlFor="enq_contact">
          Phone or Email <span className="text-brand-600">*</span>
        </label>
        <InputGlow>
          <div className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-[10px]">
            <IconMessageCircle className="size-5 text-slate-400 shrink-0" stroke={1.5} />
            <input id="enq_contact" name="contact" required className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400" placeholder="+91 00000 00000" />
          </div>
        </InputGlow>
      </div>
      <div className="space-y-1.5">
        <label className="label font-medium text-slate-700" htmlFor="enq_message">Message</label>
        <InputGlow>
          <div className="flex items-start gap-3 bg-white px-3 py-3 rounded-[10px]">
            <IconNote className="size-5 text-slate-400 shrink-0 mt-0.5" stroke={1.5} />
            <textarea id="enq_message" name="message" rows={4} className="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 resize-none" placeholder="How can we help you?" />
          </div>
        </InputGlow>
      </div>
      <TurnstileWidget />
      <Notice state={state} />
      <SubmitButton label="Send Message" />
    </form>
  );
}

export function NewsletterForm({ sourcePage = "/" }: { sourcePage?: string }) {
  const [state, formAction] = useActionState(subscribeNewsletter, initialState);
  return (
    <form action={formAction} className="space-y-3">
      <Honeypot />
      <input type="hidden" name="source_page" value={sourcePage} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <InputGlow className="flex-1">
          <input
            name="email"
            type="email"
            required
            placeholder="Your email address"
            className="input !rounded-[10px]"
            aria-label="Email address"
          />
        </InputGlow>
        <button type="submit" className="btn-accent whitespace-nowrap rounded-xl">
          Subscribe
        </button>
      </div>
      <TurnstileWidget />
      <Notice state={state} />
    </form>
  );
}
