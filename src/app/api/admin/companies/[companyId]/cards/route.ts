import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params
  const search = request.nextUrl.searchParams
  const query = new URLSearchParams({ company_id: companyId })
  if (search.get("page")) query.set("page", search.get("page")!)
  if (search.get("limit")) query.set("limit", search.get("limit")!)
  if (search.get("search")) query.set("search", search.get("search")!)
  return proxyRequest(request, `/company/card?${query}`)
}
