import { NextRequest, NextResponse } from "next/server"
import {
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_COOKIE,
  refreshAccessToken,
  clearAuthCookies,
} from "@/lib/auth"

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 })
  }

  const result = await refreshAccessToken(refreshToken)

  if (!result) {
    const response = NextResponse.json(
      { error: "Session expired" },
      { status: 401 }
    )
    clearAuthCookies(response)
    return response
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 14 * 60,
  })

  return response
}
