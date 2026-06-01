import { NextRequest, NextResponse } from "next/server"
import serverApi from "@/lib/api/server"
import { ApiError } from "@/lib/api/errors"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { orderId } = body as { orderId: string }

  if (typeof orderId !== "string" || !orderId) {
    return NextResponse.json({ error: "Invalid orderId" }, { status: 400 })
  }

  try {
    const res = await serverApi.post<{ clientSecret: string }>(
      "/payments/stripe/intent",
      { orderId },
    )
    return NextResponse.json(res.data)
  } catch (err) {
    const status = err instanceof ApiError ? (err.status ?? 502) : 502
    const message = err instanceof Error ? err.message : "Payment initialisation failed"
    return NextResponse.json({ error: message }, { status })
  }
}
