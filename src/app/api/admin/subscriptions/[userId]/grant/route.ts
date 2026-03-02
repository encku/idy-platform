import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  return proxyRequest(request, `/admin/subscription/${userId}/grant`, {
    method: "POST",
    body: request.body,
    headers: { "Content-Type": "application/json" },
  })
}
