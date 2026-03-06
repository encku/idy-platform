import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

const ALLOWED_PATHS = new Set([
  "status",
  "totp/setup",
  "totp/verify-setup",
  "email/setup",
  "email/verify-setup",
  "disable",
  "backup-codes/regenerate",
])

function validatePath(segments: string[]): string | null {
  // Reject path traversal attempts
  if (segments.some((s) => s === ".." || s === "." || s.includes("/"))) {
    return null
  }
  const joined = segments.join("/")
  return ALLOWED_PATHS.has(joined) ? joined : null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const validPath = validatePath(path)
  if (!validPath) {
    return new Response("Not found", { status: 404 })
  }
  return proxyRequest(request, `/user/2fa/${validPath}`)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const validPath = validatePath(path)
  if (!validPath) {
    return new Response("Not found", { status: 404 })
  }
  const body = await request.text()
  return proxyRequest(request, `/user/2fa/${validPath}`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
