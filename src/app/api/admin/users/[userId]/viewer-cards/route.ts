import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  return proxyRequest(request, `/admin/user/${userId}/viewer-cards`)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const body = await request.text()
  return proxyRequest(request, `/admin/user/${userId}/viewer-cards`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
