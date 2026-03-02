import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get("page") || "1"
  const limit = searchParams.get("limit") || "20"
  const search = searchParams.get("search") || ""
  const orderBy = searchParams.get("order_by") || "desc"

  const query = new URLSearchParams({ page, limit, search, order_by: orderBy })
  return proxyRequest(request, `/admin/card?${query}`)
}
