import { NextRequest, NextResponse } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  return proxyRequest(request, `/admin/user/${userId}`)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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

  const res = await fetch(`${API_URL}/admin/user/${userId}`, {
    method: "PUT",
    headers: fetchHeaders,
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return NextResponse.json(err || { error: "Failed" }, { status: res.status })
  }

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  return proxyRequest(request, `/admin/user/${userId}`, { method: "DELETE" })
}
