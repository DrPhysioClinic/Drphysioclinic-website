# Dr Physio – Ortho & Sports Injury Clinic

Clinic website + admin portal. **Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase**.

The public site is **static + ISR** (serves fast and keeps working even if the Supabase
free-tier project pauses). The `/admin` portal is **dynamic** and gated by Supabase Auth.

## Architecture

- **Public site** (`src/app/(public)/…`) — `revalidate = 3600`, `generateStaticParams` for
  dynamic routes. Reads via the **anon** client (`lib/supabase/public.ts`); RLS returns only
  published rows.
- **Admin** (`src/app/admin/…`) — `dynamic = 'force-dynamic'`. CRUD runs through the
  **authenticated session** client (`lib/supabase/server.ts`) so RLS + `is_admin()` apply.
  Middleware (`src/middleware.ts`) refreshes the session and redirects unauthenticated users to
  `/admin/login`; the panel layout re-checks `is_admin()`.
- The **service-role** client (`lib/supabase/admin.ts`) is isolated, server-only, and unused by
  default. Never import it in client code.

## Setup

```bash
cp .env.example .env.local   # values are already populated for this project
npm install
npm run dev
```

### Environment variables

| var | purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key (safe client-side; RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only; **never** import in client code |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | optional form spam protection (no-op if unset) |
| `NEXT_PUBLIC_SITE_URL` | public origin for canonical URLs / sitemap |

### Database

The schema (tables, RLS, `is_admin()`, seed data) is already applied to project
`sfznvsrwaquadutvlviq`. A public `media` Storage bucket exists for admin image uploads
(admin-only write, public read).

Regenerate DB types after schema changes:

```bash
supabase login           # one-time
npm run gen:types        # → src/types/database.ts
```

## Admin bootstrap (required before login works)

1. Create your admin user in **Supabase → Auth → Users** (or sign in once), copy its UUID.
2. Run in the SQL editor:
   ```sql
   insert into public.admins (user_id, email) values ('<uuid>', '<email>');
   ```
3. **Disable public sign-ups** in Auth settings (defense in depth).

Then sign in at `/admin/login`.

## Forms & analytics

- Appointment / enquiry / newsletter submit via **server actions** (`src/app/actions/forms.ts`)
  with a hidden honeypot + optional Turnstile. RLS allows public insert only on those tables.
- Call / WhatsApp clicks and form submits log to `analytics_events`
  (`src/app/actions/analytics.ts`). Prune old rows periodically to stay under the 500 MB free tier.

## Images

`next/image` everywhere. Admin uploads are compressed/resized to WebP (max ~1600px) in the
browser (`browser-image-compression`) before upload — no paid Supabase transformations.
Placeholder images (placehold.co) are used until real assets are added.

## Notes / TODO

- **Phone:** All phone values come from the `settings` table; nothing is hardcoded.
- Cosmetic polish, real imagery, and richer content come in a later phase.
