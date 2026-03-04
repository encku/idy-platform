import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string; linkId: string }> }
) {
  const { connectionId, linkId } = await params
  const body = await request.text()
  return proxyRequest(request, `/admin/ad-sync/connections/${connectionId}/users/${linkId}/resync`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
