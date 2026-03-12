import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string; fieldId: string }> }
) {
  const { cardId, fieldId } = await params
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.text()

  const res = await fetch(`${API_URL}/card/${cardId}/field/${fieldId}/active`, {
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

  revalidateTag(`card-${cardId}`, { expire: 0 })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data)
}
