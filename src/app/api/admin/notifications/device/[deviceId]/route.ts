import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const { deviceId } = await params
  return proxyRequest(request, `/notifications/remove-device-by-id/${deviceId}`, {
    method: "DELETE",
  })
}
