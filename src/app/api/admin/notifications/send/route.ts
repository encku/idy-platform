import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyRequest(request, "/notifications/send-to-user", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
