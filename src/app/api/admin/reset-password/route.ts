import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  const body = await request.text()
  return proxyRequest(request, "/user/reset_password_request", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  })
}
