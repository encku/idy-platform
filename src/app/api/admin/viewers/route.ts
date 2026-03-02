import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get("page") || "1"
  const limit = searchParams.get("limit") || "20"
  const search = searchParams.get("search") || ""

  const query = new URLSearchParams({ page, limit, search })
  return proxyRequest(request, `/company/viewer?${query}`)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyRequest(request, "/company/viewer", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
