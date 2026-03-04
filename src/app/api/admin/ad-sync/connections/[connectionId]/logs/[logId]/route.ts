import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string; logId: string }> }
) {
  const { connectionId, logId } = await params
  return proxyRequest(request, `/admin/ad-sync/connections/${connectionId}/logs/${logId}`)
}
