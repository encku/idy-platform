import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const challenge_token = typeof body.challenge_token === "string" ? body.challenge_token.trim() : ""

    if (!challenge_token) {
      return NextResponse.json(
        { error: "Missing challenge_token" },
        { status: 400 }
      )
    }

    const res = await fetch(`${API_URL}/user/2fa/challenge/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challenge_token }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => null)
      return NextResponse.json(
        { error: err?.error || "Failed to resend code" },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[2fa/resend-email] error:", err)
    return NextResponse.json(
      { error: "Failed to resend code" },
      { status: 500 }
    )
  }
}
