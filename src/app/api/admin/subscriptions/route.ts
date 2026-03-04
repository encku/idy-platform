import { NextRequest, NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const query = new URLSearchParams()
  if (searchParams.get("page")) query.set("page", searchParams.get("page")!)
  if (searchParams.get("limit")) query.set("limit", searchParams.get("limit")!)
  if (searchParams.get("status")) query.set("status", searchParams.get("status")!)
  if (searchParams.get("search")) query.set("search", searchParams.get("search")!)
  const qs = query.toString()

  const res = await fetch(
    `${API_URL}/admin/subscription/all${qs ? `?${qs}` : ""}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Backend error" }))
    return NextResponse.json(err, { status: res.status })
  }

  const body = await res.json()
  // Backend returns: { data: { subscriptions: [...], pagination: { total, ... } } }
  const inner = body.data ?? body
  const subscriptions = inner.subscriptions ?? inner.data ?? []
  const total = inner.pagination?.total ?? inner.total ?? 0
  return NextResponse.json({
    data: Array.isArray(subscriptions) ? subscriptions : [],
    total,
  })
}
