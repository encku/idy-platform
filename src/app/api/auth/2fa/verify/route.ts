import { NextRequest, NextResponse } from "next/server"
import { setAuthCookies } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const challenge_token = typeof body.challenge_token === "string" ? body.challenge_token.trim() : ""
    const code = typeof body.code === "string" ? body.code.trim() : ""

    if (!challenge_token || !code) {
      return NextResponse.json(
        { error: "Missing challenge_token or code" },
        { status: 400 }
      )
    }

    // Step 1: Verify 2FA code with backend
    const verifyRes = await fetch(`${API_URL}/user/2fa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge_token, code }),
    })

    if (!verifyRes.ok) {
      const err = await verifyRes.json().catch(() => null)
      return NextResponse.json(
        { error: err?.error || "Verification failed" },
        { status: verifyRes.status }
      )
    }

    const verifyData = await verifyRes.json()
    const refreshToken = verifyData.data.refresh_token.token
    const user = verifyData.data.user

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

    // Step 3: Set cookies and return
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, email_verified: user.email_verified },
      backup_code_used: verifyData.data.backup_code_used || false,
      backup_codes_remaining: verifyData.data.backup_codes_remaining,
    })

    setAuthCookies(response, accessToken, refreshToken, {
      id: user.id,
      name: user.name,
      email: user.email,
      email_verified: user.email_verified,
    })

    return response
  } catch (err) {
    console.error("[2fa/verify] error:", err)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}
