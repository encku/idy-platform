import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = new URLSearchParams()
  if (searchParams.get("page")) query.set("page", searchParams.get("page")!)
  if (searchParams.get("limit")) query.set("limit", searchParams.get("limit")!)
  if (searchParams.get("status")) query.set("status", searchParams.get("status")!)
  if (searchParams.get("search")) query.set("search", searchParams.get("search")!)
  const qs = query.toString()
  return proxyRequest(request, `/admin/subscription/all${qs ? `?${qs}` : ""}`)
}
