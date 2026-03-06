import { NextRequest, NextResponse } from "next/server"

// Cookie names
export const ACCESS_TOKEN_COOKIE = "idy_access_token"
export const REFRESH_TOKEN_COOKIE = "idy_refresh_token"
export const USER_COOKIE = "idy_user"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Cookie options
function tokenCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }
}

const ACCESS_TOKEN_MAX_AGE = 14 * 60 // 14 minutes
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

// Set all auth cookies on a NextResponse
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  user: { id: number; name: string; email: string; email_verified: boolean }
) {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    tokenCookieOptions(ACCESS_TOKEN_MAX_AGE)
  )
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    tokenCookieOptions(REFRESH_TOKEN_MAX_AGE)
  )
  response.cookies.set(USER_COOKIE, Buffer.from(JSON.stringify(user)).toString("base64"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}

// Clear all auth cookies
export function clearAuthCookies(response: NextResponse) {
  for (const name of [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_COOKIE]) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 })
  }
}

// Exchange refresh token for a new access token via backend
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string } | null> {
  try {
    const res = await fetch(`${API_URL}/user/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    })

    if (!res.ok) return null

    const data = await res.json()
    return { accessToken: data.data.token }
  } catch {
    return null
  }
}

// Get access token from request cookies (for middleware)
export function getAccessToken(request: NextRequest): string | undefined {
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
}

// Get refresh token from request cookies (for middleware)
export function getRefreshToken(request: NextRequest): string | undefined {
  return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
}

// Check if a JWT is expired by decoding the payload
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// Extract the role claim from a JWT token
export function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.role || null
  } catch {
    return null
  }
}