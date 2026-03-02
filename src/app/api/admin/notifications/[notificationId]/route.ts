import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const { notificationId } = await params
  return proxyRequest(request, `/notifications/${notificationId}`, {
    method: "DELETE",
  })
}
