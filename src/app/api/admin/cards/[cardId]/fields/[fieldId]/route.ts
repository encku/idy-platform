import { NextRequest, NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string; fieldId: string }> }
) {
  const { cardId, fieldId } = await params
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const contentType = request.headers.get("content-type") || ""
  const fetchHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  }

  let body: BodyInit
  if (contentType.includes("multipart/form-data")) {
    body = await request.arrayBuffer().then((buf) => Buffer.from(buf))
    fetchHeaders["Content-Type"] = contentType
  } else {
    body = await request.text()
    fetchHeaders["Content-Type"] = "application/json"
  }

  const res = await fetch(`${API_URL}/admin/card/${cardId}/field/${fieldId}`, {
    method: "PUT",
    headers: fetchHeaders,
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(err || { error: "Failed" }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
