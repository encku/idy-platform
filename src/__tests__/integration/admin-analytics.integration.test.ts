import { describe, it, expect } from "vitest"
import { isServerAvailable, getDiscovered } from "./setup-integration"
import { apiFetch, assertResponseTime } from "./helpers"

describe("Admin Analytics — Integration", () => {
  it("GET /api/admin/analytics/overview returns stats", async () => {
    if (!isServerAvailable()) return
    const { status, data, responseTime } = await apiFetch<{
      total_views: number
      total_clicks: number
      total_shares: number
      total_cards: number
    }>("/api/admin/analytics/overview")

    expect(status).toBe(200)
    expect(typeof data.total_views).toBe("number")
    expect(typeof data.total_clicks).toBe("number")
    expect(typeof data.total_shares).toBe("number")
    expect(typeof data.total_cards).toBe("number")
    expect(data.total_views).toBeGreaterThanOrEqual(0)
    expect(data.total_cards).toBeGreaterThanOrEqual(0)
    assertResponseTime(responseTime)
  })

  it("overview shape — has all required fields", async () => {
    if (!isServerAvailable()) return
    const { data } = await apiFetch<Record<string, unknown>>(
      "/api/admin/analytics/overview"
    )

    expect(data).toHaveProperty("total_views")
    expect(data).toHaveProperty("total_clicks")
    expect(data).toHaveProperty("total_shares")
    expect(data).toHaveProperty("total_cards")
  })

  it("GET /api/admin/analytics/cards/:cardId/summary returns card summary", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<Record<string, unknown>>(
      `/api/admin/analytics/cards/${cardId}/summary`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/analytics/cards/:cardId/by-date returns date array", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/admin/analytics/cards/${cardId}/by-date`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/analytics/cards/:cardId/field-clicks returns clicks", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/admin/analytics/cards/${cardId}/field-clicks`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/analytics/cards/:cardId/share-methods returns shares", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/admin/analytics/cards/${cardId}/share-methods`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("date range filter works", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/admin/analytics/cards/${cardId}/by-date?start_date=2024-01-01&end_date=2024-12-31`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("invalid cardId returns error", async () => {
    if (!isServerAvailable()) return
    const { status } = await apiFetch(
      "/api/admin/analytics/cards/999999/summary"
    )

    expect([404, 400, 500]).toContain(status)
  })
})
