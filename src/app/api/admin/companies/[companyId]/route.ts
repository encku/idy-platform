import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params
  return proxyRequest(request, `/company/${companyId}`)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params
  const body = await request.text()
  return proxyRequest(request, `/company/${companyId}`, {
    method: "PUT",
    body,
    headers: { "Content-Type": "application/json" },
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params
  return proxyRequest(request, `/company/${companyId}`, {
    method: "DELETE",
  })
}
