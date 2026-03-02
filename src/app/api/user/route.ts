import { NextRequest, NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE, clearAuthCookies } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Decode user ID from JWT
  let userId: number | null = null
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    userId = payload.userId || payload.user_id || payload.id
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  const res = await fetch(`${API_URL}/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(err || { error: "Failed" }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const contentType = request.headers.get("content-type") || ""
  const isFormData = contentType.includes("multipart/form-data")

  const fetchHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  }

  let body: BodyInit
  if (isFormData) {
    body = await request.arrayBuffer().then((buf) => Buffer.from(buf))
    fetchHeaders["Content-Type"] = contentType
  } else {
    body = await request.text()
    fetchHeaders["Content-Type"] = "application/json"
  }

  const res = await fetch(`${API_URL}/user`, {
    method: "PUT",
    headers: fetchHeaders,
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(err || { error: "Failed" }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let userId: number | null = null
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    userId = payload.userId || payload.user_id || payload.id
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  const res = await fetch(`${API_URL}/user/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(err || { error: "Failed" }, { status: res.status })
  }

  const response = NextResponse.json({ success: true })
  clearAuthCookies(response)
  return response
}
