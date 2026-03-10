import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyRequest(request, "/admin/card/check-bulk-emails", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
