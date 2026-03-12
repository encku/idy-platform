import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const res = await fetch(`${API_URL}/card/${cardId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(err || { error: "Failed" }, { status: res.status })
  }

  const data = await res.json()
  const response = NextResponse.json(data)
  response.headers.set("Cache-Control", "private, max-age=30, stale-while-revalidate=60")
  return response
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const res = await fetch(`${API_URL}/card/${cardId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(err || { error: "Failed" }, { status: res.status })
  }

  revalidateTag(`card-${cardId}`, { expire: 0 })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data)
}
