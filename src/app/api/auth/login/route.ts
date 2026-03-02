import { NextRequest, NextResponse } from "next/server"
import { setAuthCookies } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  // Step 1: Login — get user + refresh token
  const loginRes = await fetch(`${API_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!loginRes.ok) {
    const err = await loginRes.json().catch(() => null)
    return NextResponse.json(
      { error: err?.message || "Invalid email or password" },
      { status: loginRes.status }
    )
  }

  const loginData = await loginRes.json()
  const refreshToken = loginData.data.refresh_token.token
  const user = loginData.data.user

  // Step 2: Exchange refresh token for access token (JWT)
  const tokenRes = await fetch(`${API_URL}/user/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: refreshToken }),
  })

  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: "Failed to obtain token" },
      { status: 500 }
    )
  }

  const tokenData = await tokenRes.json()
  const accessToken = tokenData.data.token

  // Step 3: Set HTTP-only cookies and return success
  const response = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, email_verified: user.email_verified },
  })

  setAuthCookies(response, accessToken, refreshToken, {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: user.email_verified,
  })

  return response
}
