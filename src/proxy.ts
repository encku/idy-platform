import { NextRequest, NextResponse } from "next/server"
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  isTokenExpired,
  refreshAccessToken,
  getRoleFromToken,
} from "@/lib/auth"

const ADMIN_ROLES = ["admin", "company_admin"]

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"]

// Admin routes that require authentication
const ADMIN_ROUTES = ["/", "/dashboard", "/settings", "/users"]

const BOT_USER_AGENTS = [
  "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider",
  "yandexbot", "sogou", "exabot", "facebot", "facebookexternalhit",
  "ia_archiver", "alexa", "msnbot", "semrushbot", "ahrefsbot",
  "dotbot", "petalbot", "mj12bot", "bytespider", "gptbot",
  "claudebot", "anthropic-ai", "ccbot", "chatgpt-user", "applebot",
  "twitterbot", "linkedinbot", "whatsapp", "telegrambot", "discordbot",
  "slackbot", "scrapy", "httpclient", "python-requests", "curl",
  "wget", "go-http-client", "java", "headlesschrome", "phantomjs",
]

const KNOWN_ROUTES = [
  "login", "register", "forgot-password", "reset-password", "verify-email",
  "api", "_next", "dashboard", "settings", "users",
  "profile", "cards", "card", "ai-assistant", "stats",
  "admin", "subscription",
]

function isCardRoute(pathname: string): boolean {
  // Single-segment paths like /abc123 (public card view)
  // or two-segment paths like /abc123/secret456 (card registration)
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length < 1 || segments.length > 2) return false
  // First segment must not be a known app route
  return !KNOWN_ROUTES.includes(segments[0])
}

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block bots on card routes
  if (isCardRoute(pathname)) {
    const userAgent = request.headers.get("user-agent") || ""
    if (isBot(userAgent)) {
      return new NextResponse("Not Found", { status: 404 })
    }
  }

  // Skip public API routes
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/register") ||
    pathname.startsWith("/api/forgot-password") ||
    pathname.startsWith("/api/reset-password") ||
    pathname.startsWith("/api/verify-email")
  ) {
    return NextResponse.next()
  }

  // Card routes are public — no auth required
  if (isCardRoute(pathname)) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))

  // Has valid access token
  if (accessToken && !isTokenExpired(accessToken)) {
    // Allow authenticated users to access /verify-email (they may click the link while logged in)
    if (pathname.startsWith("/verify-email")) {
      return NextResponse.next()
    }

    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Protect admin routes (pages + API): only admin and company_admin roles allowed
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      const role = getRoleFromToken(accessToken)
      if (!role || !ADMIN_ROLES.includes(role)) {
        if (pathname.startsWith("/api/admin")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    return NextResponse.next()
  }

  // Access token missing/expired but refresh token exists — try refresh
  if (refreshToken) {
    const result = await refreshAccessToken(refreshToken)

    if (result) {
      const isVerifyEmail = pathname.startsWith("/verify-email")
      const response = (isPublicRoute && !isVerifyEmail)
        ? NextResponse.redirect(new URL("/", request.url))
        : NextResponse.next()

      response.cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 14 * 60,
      })

      // Protect admin routes (pages + API) after token refresh
      if (!isPublicRoute && (pathname.startsWith("/admin") || pathname.startsWith("/api/admin"))) {
        const role = getRoleFromToken(result.accessToken)
        if (!role || !ADMIN_ROLES.includes(role)) {
          if (pathname.startsWith("/api/admin")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
          }
          return NextResponse.redirect(new URL("/", request.url))
        }
      }

      return response
    }
  }

  // No valid session — redirect to login (unless already there)
  if (!isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
