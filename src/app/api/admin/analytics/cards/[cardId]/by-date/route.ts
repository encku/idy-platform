import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params
  const search = request.nextUrl.searchParams
  const query = new URLSearchParams()
  if (search.get("start_date")) query.set("start_date", search.get("start_date")!)
  if (search.get("end_date")) query.set("end_date", search.get("end_date")!)
  const qs = query.toString()
  return proxyRequest(request, `/analytics/card/${cardId}/by-date${qs ? `?${qs}` : ""}`)
}
