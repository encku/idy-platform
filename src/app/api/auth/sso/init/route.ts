import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function POST(request: NextRequest) {
  const body = await request.text()

  const res = await fetch(`${API_URL}/user/sso/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
