import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get("limit") || "5"
  return proxyRequest(request, `/dashboard/recent-activities?limit=${limit}`, {
    cacheControl: "private, max-age=30, stale-while-revalidate=60",
  })
}
