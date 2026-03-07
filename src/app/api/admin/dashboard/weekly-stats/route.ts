import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  return proxyRequest(request, "/dashboard/weekly-stats", {
    cacheControl: "private, max-age=30, stale-while-revalidate=60",
  })
}
