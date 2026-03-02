import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params
  const body = await request.text()
  return proxyRequest(request, `/admin/card/${cardId}/clone`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
