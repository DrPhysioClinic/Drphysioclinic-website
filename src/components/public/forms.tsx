"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitAppointment,
  submitEnquiry,
  subscribeNewsletter,
  type FormState,
} from "@/app/actions/forms";
import { PAYMENT_MODES } from "@/lib/constants";
import { TurnstileWidget } from "@/components/public/turnstile-widget";
import type { Service } from "@/types/database";

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
    <form action={formAction} className="space-y-4">
      <Honeypot />
      <input type="hidden" name="source_page" value={sourcePage} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="patient_name">Full Name *</label>
          <input id="patient_name" name="patient_name" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone *</label>
          <input id="phone" name="phone" type="tel" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="gender">Gender</label>
          <select id="gender" name="gender" className="input">
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="service_id">Service</label>
          <select id="service_id" name="service_id" className="input">
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="payment_mode">Payment Mode (info only)</label>
          <select id="payment_mode" name="payment_mode" className="input">
            <option value="">Select</option>
            {PAYMENT_MODES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="preferred_date">Preferred Date</label>
          <input id="preferred_date" name="preferred_date" type="date" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="preferred_time">Preferred Time</label>
          <input id="preferred_time" name="preferred_time" type="text" placeholder="e.g. 11:00 AM" className="input" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows={3} className="input" />
      </div>
      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" name="terms_accepted" className="mt-1" />
        I agree to be contacted about my appointment and accept the clinic&apos;s terms.
      </label>
      <TurnstileWidget />
      <Notice state={state} />
      <SubmitButton label="Book Appointment" />
    </form>
  );
}

export function EnquiryForm({ sourcePage = "/contact" }: { sourcePage?: string }) {
  const [state, formAction] = useActionState(submitEnquiry, initialState);
  return (
    <form action={formAction} className="space-y-4">
      <Honeypot />
      <input type="hidden" name="source_page" value={sourcePage} />
      <div>
        <label className="label" htmlFor="enq_name">Name *</label>
        <input id="enq_name" name="name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="enq_contact">Phone or Email *</label>
        <input id="enq_contact" name="contact" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="enq_message">Message</label>
        <textarea id="enq_message" name="message" rows={4} className="input" />
      </div>
      <TurnstileWidget />
      <Notice state={state} />
      <SubmitButton label="Send Enquiry" />
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
        <input
          name="email"
          type="email"
          required
          placeholder="Your email address"
          className="input flex-1"
          aria-label="Email address"
        />
        <button type="submit" className="btn-accent whitespace-nowrap">
          Subscribe
        </button>
      </div>
      <TurnstileWidget />
      <Notice state={state} />
    </form>
  );
}
