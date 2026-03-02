import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  return proxyRequest(request, "/admin/subscription/sync-all", { method: "POST" })
}
