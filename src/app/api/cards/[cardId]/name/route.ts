import { NextRequest, NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.text()

  const res = await fetch(`${API_URL}/card/${cardId}/name`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(err || { error: "Failed" }, { status: res.status })
  }

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data)
}
