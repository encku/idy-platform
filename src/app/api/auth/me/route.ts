import { NextRequest, NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE, USER_COOKIE } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const userCookie = request.cookies.get(USER_COOKIE)?.value

  if (!accessToken || !userCookie) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1]))
    const user = JSON.parse(atob(userCookie))

    return NextResponse.json({
      authenticated: true,
      user,
      role: payload.role,
      expiresAt: payload.exp,
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
