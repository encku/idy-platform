import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const { assignmentId } = await params
  return proxyRequest(request, `/company/user/assignment/${assignmentId}`, {
    method: "DELETE",
  })
}
