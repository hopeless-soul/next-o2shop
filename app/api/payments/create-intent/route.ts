import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import serverApi from "@/lib/api/server"
import { ApiError } from "@/lib/api/errors"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { orderId, email } = body as { orderId: string; email?: string }

  if (typeof orderId !== "string" || !orderId) {
    return NextResponse.json({ error: "Invalid orderId" }, { status: 400 })
  }

  // /payments/stripe/intent requires a logged-in session (Bearer auth); guests
  // have no access_token cookie and must use the guest-intent endpoint instead.
  const cookieStore = await cookies()
  const isAuthenticated = !!cookieStore.get("access_token")?.value

  if (!isAuthenticated && (typeof email !== "string" || !email)) {
    return NextResponse.json({ error: "Email is required for guest checkout" }, { status: 400 })
  }

  try {
    const res = await serverApi.post<{ clientSecret: string }>(
      isAuthenticated ? "/payments/stripe/intent" : "/payments/stripe/guest-intent",
      isAuthenticated ? { orderId } : { orderId, email },
    )
    return NextResponse.json(res.data)
  } catch (err) {
    const status = err instanceof ApiError ? (err.status ?? 502) : 502
    const message = err instanceof Error ? err.message : "Payment initialisation failed"
    return NextResponse.json({ error: message }, { status })
  }
}
