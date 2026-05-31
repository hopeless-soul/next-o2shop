import { NextRequest, NextResponse } from "next/server";

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token")?.value;
  const isAuthenticated = !!accessToken && decodeRole(accessToken) !== null;

  // Redirect authenticated users away from auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/account", req.url));
    }
    return NextResponse.next();
  }

  // Unauthenticated: bounce through /auth/refresh which can read the
  // refresh_token cookie (Path=/auth/refresh — browser only sends it there)
  if (!isAuthenticated) {
    const next = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/auth/refresh?next=${next}`, req.url));
  }

  // Admin role check
  if (pathname.startsWith("/admin") && decodeRole(accessToken!) !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/login", "/register"],
};
