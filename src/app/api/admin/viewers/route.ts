import { NextRequest, NextResponse } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = searchParams.get("page") || "1"
  const limit = searchParams.get("limit") || "20"
  const search = searchParams.get("search") || ""

  const query = new URLSearchParams({ page, limit, search })
  const res = await fetch(`${API_URL}/company/viewer?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Backend error" }))
    return NextResponse.json(err, { status: res.status })
  }

  const body = await res.json()
  // Backend wraps via helpers.DataResponse: { data: { data: [...], total, ... } }
  const inner = body.data ?? body
  return NextResponse.json({
    data: Array.isArray(inner.data) ? inner.data : Array.isArray(inner) ? inner : [],
    total: inner.total ?? 0,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyRequest(request, "/company/viewer", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
