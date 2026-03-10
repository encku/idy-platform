import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get("page") || "1"
  const limit = searchParams.get("limit") || "20"
  const search = searchParams.get("search") || ""
  const orderBy = searchParams.get("order_by") || "desc"
  const companyId = searchParams.get("company_id") || ""
  const role = searchParams.get("role") || ""

  const query = new URLSearchParams({ page, limit, search, order_by: orderBy })
  if (companyId) query.set("company_id", companyId)
  if (role) query.set("role", role)
  return proxyRequest(request, `/admin/user?${query}`)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyRequest(request, "/admin/user", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
