import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

// TODO: Backend may not support PUT/DELETE for field types — verify availability
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ fieldTypeId: string }> }
) {
  const { fieldTypeId } = await params
  const body = await request.text()
  return proxyRequest(request, `/field_type/${fieldTypeId}`, {
    method: "PUT",
    body,
    headers: { "Content-Type": "application/json" },
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fieldTypeId: string }> }
) {
  const { fieldTypeId } = await params
  return proxyRequest(request, `/field_type/${fieldTypeId}`, {
    method: "DELETE",
  })
}
