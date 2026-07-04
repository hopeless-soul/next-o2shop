// Edge middleware gating access to auth and account/admin routes.
// Only runs for paths listed in `config.matcher` below.
import { NextRequest, NextResponse } from "next/server";

/* Matcher ────────────────────────────────────────────────────────────────── */

// Restricts which routes invoke `middleware`. 
// Тot matched Paths: skip this file entirely.
export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/login", "/register"],
};

/* Role decode ────────────────────────────────────────────────────────────── */

// Reads the `role` and `exp` claims out of a JWT's payload segment.
function decodeRole(token: string): string | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { role?: string; exp?: number };
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload.role ?? null;
  } catch {
    return null;
  }
}

/* Middleware ─────────────────────────────────────────────────────────────── */

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;
  // "Authenticated" here means: cookie present, decodable, and not expired.
  const isAuthenticated = !!accessToken && decodeRole(accessToken) !== null;

  /**
   * Case 1: /login or /register — these are only useful when signed out.
   * Redirect user to /account, if is already signed in.
   */
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/account", req.url));
    }
    return NextResponse.next();
  }


  /**
   * Case 2: everything else in the matcher (/admin, /account) requires auth.
   * 
   * Unauthenticated: bounce through /auth/refresh which can read the
   * refresh_token cookie (Path=/auth/refresh — browser only sends it there)
   * and attempt to silently mint a new access_token before continuing on
   * to `next`, instead of sending the user straight to /login.
   */
  if (!isAuthenticated) {
    const next = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/auth/refresh?next=${next}`, req.url));
  }

  /**
   * Case 3: authenticated, but /admin/* additionally requires the admin role.
   * Redirect them to the home page if the user is not an admin.
   */
  if (pathname.startsWith("/admin") && decodeRole(accessToken!) !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Authenticated (and admin-checked if applicable) — allow the request through.
  return NextResponse.next();
}

