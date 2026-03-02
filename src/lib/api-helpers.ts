import { NextRequest, NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

/** Forward an authenticated request to the backend API */
export async function proxyRequest(
  request: NextRequest,
  path: string,
  options: {
    method?: string
    body?: BodyInit | null
    headers?: Record<string, string>
  } = {}
) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const fetchHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || request.method,
    headers: fetchHeaders,
    body: options.body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Backend error" }))
    return NextResponse.json(err, { status: res.status })
  }

  const data = await res.json().catch(() => ({}))

  // Normalize backend pagination: { pagination: { maximum_row } } → { total }
  if (data.pagination && !("total" in data)) {
    data.total = data.pagination.maximum_row ?? 0
  }

  return NextResponse.json(data)
}

/** Get the user ID from the JWT payload.
 *  Checks multiple claim names for compatibility with different token formats. */
export function getUserIdFromToken(request: NextRequest): number | null {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.user_id || payload.userId || payload.id || null
  } catch {
    return null
  }
}
