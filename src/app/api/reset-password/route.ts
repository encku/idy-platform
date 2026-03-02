import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function POST(request: NextRequest) {
  const { password, token } = await request.json()

  const res = await fetch(`${API_URL}/user/reset_password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, token }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(
      { error: err?.error || "An error occurred", code: err?.code },
      { status: res.status }
    )
  }

  return NextResponse.json({ success: true })
}
