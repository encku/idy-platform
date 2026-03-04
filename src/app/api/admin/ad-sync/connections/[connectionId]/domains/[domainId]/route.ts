import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string; domainId: string }> }
) {
  const { connectionId, domainId } = await params
  return proxyRequest(
    request,
    `/admin/ad-sync/connections/${connectionId}/domains/${domainId}`,
    { method: "DELETE" }
  )
}
