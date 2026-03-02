import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams
  const query = new URLSearchParams()
  if (search.get("page")) query.set("page", search.get("page")!)
  if (search.get("limit")) query.set("limit", search.get("limit")!)
  if (search.get("user_id")) query.set("user_id", search.get("user_id")!)
  if (search.get("status")) query.set("status", search.get("status")!)
  const qs = query.toString()
  return proxyRequest(request, `/notifications/logs${qs ? `?${qs}` : ""}`)
}
