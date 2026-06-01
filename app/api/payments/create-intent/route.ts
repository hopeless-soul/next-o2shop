// app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from "next/server"
import serverApi from "@/lib/api/server"

export async function POST(req: NextRequest) {
  const { amount, currency } = await req.json()
  const res = await serverApi.post<{ clientSecret: string }>(
    "/payments/stripe/intent",
    { amount, currency },
  )
  return NextResponse.json(res.data)
}
