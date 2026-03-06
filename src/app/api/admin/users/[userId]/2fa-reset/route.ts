import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  return proxyRequest(request, `/admin/user/${userId}/2fa/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
}
