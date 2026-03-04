import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const res = await fetch(`${API_URL}/user/sso/check?email=${encodeURIComponent(email)}`)
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
