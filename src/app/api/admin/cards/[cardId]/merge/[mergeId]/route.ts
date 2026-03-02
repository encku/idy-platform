import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string; mergeId: string }> }
) {
  const { cardId, mergeId } = await params
  return proxyRequest(request, `/admin/card/${cardId}/merge/${mergeId}`, {
    method: "DELETE",
  })
}
