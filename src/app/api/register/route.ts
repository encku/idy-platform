import { NextRequest, NextResponse } from "next/server"
import { setAuthCookies } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Step 1: Register user
  const registerRes = await fetch(`${API_URL}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: body.name,
      email: body.email,
      password: body.password,
      public_key: body.public_key,
      private_key: body.private_key,
    }),
  })

  if (!registerRes.ok) {
    const err = await registerRes.json().catch(() => null)
    return NextResponse.json(
      { error: err?.error || "Registration failed", code: err?.code },
      { status: registerRes.status }
    )
  }

  const registerData = await registerRes.json()
  const refreshToken = registerData.data.refresh_token.token
  const user = registerData.data.user

  // Step 2: Get access token
  const tokenRes = await fetch(`${API_URL}/user/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: refreshToken }),
  })

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Failed to obtain token" }, { status: 500 })
  }

  const tokenData = await tokenRes.json()
  const accessToken = tokenData.data.token

  // Step 3: Set cookies
  const response = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, email_verified: false },
  })

  setAuthCookies(response, accessToken, refreshToken, {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: false,
  })

  return response
}
