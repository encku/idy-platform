import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const days = searchParams.get("days")
  const qs = days ? `?days=${days}` : ""
  return proxyRequest(request, `/admin/subscription/plan-changes${qs}`)
}
