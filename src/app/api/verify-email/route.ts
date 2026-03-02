import { NextRequest, NextResponse } from "next/server"
import { USER_COOKIE } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

export async function POST(request: NextRequest) {
  const { token } = await request.json()

  if (!token || typeof token !== "string" || token.trim().length < 10) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 400 }
    )
  }

  const res = await fetch(`${API_URL}/user/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(
      { error: err?.error || "An error occurred", code: err?.code },
      { status: res.status }
    )
  }

  const response = NextResponse.json({ success: true })

  // Update idy_user cookie with email_verified: true
  const userCookie = request.cookies.get(USER_COOKIE)?.value
  if (userCookie) {
    try {
      const user = JSON.parse(atob(userCookie))
      user.email_verified = true
      response.cookies.set(USER_COOKIE, btoa(JSON.stringify(user)), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      })
    } catch {
      // Cookie parse failed, skip update
    }
  }

  return response
}
