import { NextRequest, NextResponse } from "next/server"
import { setAuthCookies } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function POST(request: NextRequest) {
  const body = await request.text()

  const res = await fetch(`${API_URL}/user/sso/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(
      { error: err?.error || "SSO login failed" },
      { status: res.status }
    )
  }

  const data = await res.json()
  const { access_token, refresh_token, user } = data.data || {}

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Invalid SSO response" }, { status: 500 })
  }

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, email_verified: user.email_verified ?? true },
  })

  setAuthCookies(response, access_token, refresh_token, {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: user.email_verified ?? true,
  })

  return response
}
