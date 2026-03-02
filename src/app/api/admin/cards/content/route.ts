import { NextRequest, NextResponse } from "next/server"
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL
const CONCURRENCY = 5

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = searchParams.get("page") || "1"
  const limit = searchParams.get("limit") || "30"
  const search = searchParams.get("search") || ""

  const query = new URLSearchParams({ page, limit, search, order_by: "desc" })

  // Fetch cards list from admin endpoint
  const cardsRes = await fetch(`${API_URL}/admin/card?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!cardsRes.ok) {
    const err = await cardsRes.json().catch(() => ({ error: "Backend error" }))
    return NextResponse.json(err, { status: cardsRes.status })
  }

  const cardsData = await cardsRes.json()
  const cards: { card_public_key: string }[] = cardsData.data || []
  const total = cardsData.total || 0

  // TODO: Replace N+1 profile fetches with a bulk admin endpoint
  // (e.g., POST /admin/card/bulk-profiles or GET /admin/card?include=fields)
  // Current approach: 1 request for card list + N requests for profiles (batched by CONCURRENCY)
  const cardsWithFields: (typeof cards[number] & { fields: unknown[] })[] = []

  for (let i = 0; i < cards.length; i += CONCURRENCY) {
    const batch = cards.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.all(
      batch.map(async (card) => {
        try {
          const fieldRes = await fetch(
            `${API_URL}/card/${card.card_public_key}/profile`
          )
          if (fieldRes.ok) {
            const fieldData = await fieldRes.json()
            return {
              ...card,
              fields: (fieldData.data?.card || []).map(
                (f: {
                  id: number
                  name: string
                  data: string
                  is_active?: boolean
                  order?: number
                  field_type?: { name: string; icon_url: string }
                }) => ({
                  id: f.id,
                  name: f.name,
                  data: f.data,
                  is_active: f.is_active ?? true,
                  order: f.order ?? 0,
                  field_type: f.field_type || { name: f.name, icon_url: "" },
                })
              ),
            }
          }
        } catch {
          // ignore individual card fetch failures
        }
        return { ...card, fields: [] }
      })
    )
    cardsWithFields.push(...batchResults)
  }

  const response = NextResponse.json({ data: cardsWithFields, total })
  response.headers.set(
    "Cache-Control",
    "private, max-age=30, stale-while-revalidate=60"
  )
  return response
}
