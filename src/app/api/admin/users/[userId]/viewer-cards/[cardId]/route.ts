import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; cardId: string }> }
) {
  const { userId, cardId } = await params
  return proxyRequest(request, `/admin/user/${userId}/viewer-cards/${cardId}`, {
    method: "DELETE",
  })
}
