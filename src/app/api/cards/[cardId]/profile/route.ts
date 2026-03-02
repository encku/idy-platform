import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params

  const res = await fetch(`${API_URL}/card/${cardId}/profile`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Not found" }))
    return NextResponse.json(err, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
