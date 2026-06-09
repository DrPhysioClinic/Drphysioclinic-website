/**
 * Optional Cloudflare Turnstile verification.
 * If TURNSTILE_SECRET_KEY is unset, verification is skipped (no-op → true),
 * so forms work in dev without configuring Turnstile.
 */
export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured → skip

  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export const turnstileEnabled = () => Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
