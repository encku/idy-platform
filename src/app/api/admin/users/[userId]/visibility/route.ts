import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const body = await request.text()
  return proxyRequest(request, `/admin/user/${userId}/visibility`, {
    method: "PUT",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
