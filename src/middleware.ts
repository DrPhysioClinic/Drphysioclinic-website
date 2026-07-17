import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and gates /admin.
 * Unauthenticated users hitting /admin (except /admin/login) are redirected
 * to the login page. The is_admin() role check is still enforced by RLS on
 * every query, and re-verified in the admin layout.
 */
export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const isAdminSubdomain = host.startsWith("admin.");
  const { pathname } = request.nextUrl;

  // 1. Force subdomain enforcement for /admin accessed on the main domain
  if (process.env.NODE_ENV !== "development" && !isAdminSubdomain && pathname.startsWith("/admin")) {
    const newHost = host.includes("localhost") 
      ? `admin.${host}` 
      : `admin.${host.replace(/^www\./, "")}`;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.host = newHost;
    // Keep /admin so the next middleware pass strips it for a clean URL
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Clean URLs: Strip /admin if already on the admin subdomain
  if (isAdminSubdomain && pathname.startsWith("/admin")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/admin/, "") || "/";
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Initialize Response (Rewrite if on admin subdomain)
  let response: NextResponse;
  if (isAdminSubdomain) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    response = NextResponse.rewrite(rewriteUrl);
  } else {
    response = NextResponse.next({ request });
  }

  // 4. Supabase Auth Integration
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Note: we can't trivially re-assign response here if we used a rewrite, 
          // but Next.js + Supabase SSR handles cookie mutation safely.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() refreshes the session cookie. Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 5. Auth Gating Logic
  const isAdminRoute = isAdminSubdomain || pathname.startsWith("/admin");
  const isLoginRoute = isAdminSubdomain ? pathname === "/login" : pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAdminSubdomain ? "/login" : "/admin/login";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAdminSubdomain ? "/" : "/admin";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - static files with common image/video extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)',
  ],
};
