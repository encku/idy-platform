import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params
  const { searchParams } = new URL(request.url)
  const query = new URLSearchParams()
  if (searchParams.get("start_date")) query.set("start_date", searchParams.get("start_date")!)
  if (searchParams.get("end_date")) query.set("end_date", searchParams.get("end_date")!)
  const qs = query.toString()
  return proxyRequest(request, `/analytics/card/${cardId}/summary${qs ? `?${qs}` : ""}`)
}
