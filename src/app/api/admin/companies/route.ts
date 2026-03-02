import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams
  const query = new URLSearchParams()
  if (search.get("page")) query.set("page", search.get("page")!)
  if (search.get("limit")) query.set("limit", search.get("limit")!)
  if (search.get("search")) query.set("search", search.get("search")!)
  const qs = query.toString()
  return proxyRequest(request, `/company${qs ? `?${qs}` : ""}`)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyRequest(request, "/company", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
