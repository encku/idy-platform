import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; cardId: string }> }
) {
  const { userId, cardId } = await params
  return proxyRequest(request, `/company/viewer/${userId}/card/${cardId}`, {
    method: "DELETE",
  })
}
