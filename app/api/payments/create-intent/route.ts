import { NextRequest, NextResponse } from "next/server"
import serverApi from "@/lib/api/server"
import { ApiError } from "@/lib/api/errors"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { amount, currency } = body as { amount: number; currency: string }

  if (typeof amount !== "number" || amount <= 0 || typeof currency !== "string") {
    return NextResponse.json({ error: "Invalid amount or currency" }, { status: 400 })
  }

  try {
    const res = await serverApi.post<{ clientSecret: string }>(
      "/payments/stripe/intent",
      { amount, currency },
    )
    return NextResponse.json(res.data)
  } catch (err) {
    const status = err instanceof ApiError ? (err.status ?? 502) : 502
    const message = err instanceof Error ? err.message : "Payment initialisation failed"
    return NextResponse.json({ error: message }, { status })
  }
}
