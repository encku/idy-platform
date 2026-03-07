import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  return proxyRequest(request, `/company/my-features`, {
    cacheControl: "private, max-age=60, stale-while-revalidate=120",
  })
}
