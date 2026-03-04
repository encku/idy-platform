import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const { connectionId } = await params
  const search = request.nextUrl.searchParams
  const query = new URLSearchParams()
  if (search.get("page")) query.set("page", search.get("page")!)
  if (search.get("limit")) query.set("limit", search.get("limit")!)
  if (search.get("search")) query.set("search", search.get("search")!)
  if (search.get("status")) query.set("status", search.get("status")!)
  const qs = query.toString()
  return proxyRequest(request, `/admin/ad-sync/connections/${connectionId}/users${qs ? `?${qs}` : ""}`)
}
