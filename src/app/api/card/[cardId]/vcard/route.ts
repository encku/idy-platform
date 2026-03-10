import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params

  const res = await fetch(`${API_URL}/card/${cardId}/vcard`)

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to generate vCard" },
      { status: res.status }
    )
  }

  const body = await res.arrayBuffer()
  const headers = new Headers()
  headers.set(
    "Content-Type",
    res.headers.get("Content-Type") || "text/vcard; charset=utf-8"
  )
  const disposition = res.headers.get("Content-Disposition")
  if (disposition) {
    headers.set("Content-Disposition", disposition)
  }

  return new NextResponse(body, { status: 200, headers })
}
