import { NextRequest, NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const res = await fetch(`${API_URL}/field_type_groups`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(err || { error: "Failed" }, { status: res.status })
  }

  const data = await res.json()
  const response = NextResponse.json(data)
  response.headers.set("Cache-Control", "private, max-age=300, stale-while-revalidate=600")
  return response
}
