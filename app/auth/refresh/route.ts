import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// GET /auth/refresh?next=... — called by middleware redirects.
// The browser sends refresh_token here because the request path matches
// the cookie's Path=/auth/refresh attribute.
export async function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next") ?? "/account";
  const safeNext = next.startsWith("/") ? next : "/account";
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const redirect = NextResponse.redirect(new URL(safeNext, req.url));
    res.headers.getSetCookie().forEach((c) => redirect.headers.append("Set-Cookie", c));
    return redirect;
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// POST /auth/refresh — called by the clientApi 401 interceptor.
// Replaces the /auth/refresh rewrite in next.config.ts.
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
        "Content-Type": "application/json",
      },
    });

    const body = await res.json().catch(() => ({}));
    const response = NextResponse.json(body, { status: res.status });
    res.headers.getSetCookie().forEach((c) => response.headers.append("Set-Cookie", c));
    return response;
  } catch {
    return NextResponse.json({ message: "Refresh failed" }, { status: 500 });
  }
}
