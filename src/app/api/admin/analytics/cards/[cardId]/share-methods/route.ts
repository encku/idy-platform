import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params
  return proxyRequest(request, `/analytics/card/${cardId}/share-methods`, {
    cacheControl: "private, max-age=60, stale-while-revalidate=120",
  })
}
