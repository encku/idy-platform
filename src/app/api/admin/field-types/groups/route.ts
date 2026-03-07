import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  return proxyRequest(request, "/field_type_groups", {
    cacheControl: "private, max-age=300, stale-while-revalidate=600",
  })
}
