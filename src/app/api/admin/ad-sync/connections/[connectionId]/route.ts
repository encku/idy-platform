import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const { connectionId } = await params
  return proxyRequest(request, `/admin/ad-sync/connections/${connectionId}`)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const { connectionId } = await params
  const body = await request.text()
  return proxyRequest(request, `/admin/ad-sync/connections/${connectionId}`, {
    method: "PUT",
    body,
    headers: { "Content-Type": "application/json" },
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  const { connectionId } = await params
  return proxyRequest(request, `/admin/ad-sync/connections/${connectionId}`, {
    method: "DELETE",
  })
}
