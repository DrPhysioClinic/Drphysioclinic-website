"use client";

import Script from "next/script";

/**
 * Renders the Cloudflare Turnstile widget only if a site key is configured.
 * If unset, nothing renders and the server action skips verification.
 */
export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} />
    </>
  );
}
