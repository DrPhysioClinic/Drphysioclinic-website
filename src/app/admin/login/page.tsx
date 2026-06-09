"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type AuthState } from "@/app/admin/auth-actions";

const initial: AuthState = { error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Signing in…" : "Sign In"}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(signIn, initial);
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-center text-xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Dr Physio Clinic — staff only
        </p>
        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required className="input" autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input"
              autoComplete="current-password"
            />
          </div>
          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
          )}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
