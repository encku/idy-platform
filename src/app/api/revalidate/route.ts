import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidation-secret")
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.tag) {
    return NextResponse.json({ error: "Missing tag" }, { status: 400 })
  }

  revalidateTag(body.tag, { expire: 0 })
  return NextResponse.json({ revalidated: true })
}
