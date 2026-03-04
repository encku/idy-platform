import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const { connectionId } = await params
  const body = await request.text()
  return proxyRequest(request, `/admin/ad-sync/connections/${connectionId}/sync`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
