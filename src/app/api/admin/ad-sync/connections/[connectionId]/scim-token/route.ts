import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const { connectionId } = await params
  return proxyRequest(request, `/admin/ad-sync/connections/${connectionId}/scim-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
}
