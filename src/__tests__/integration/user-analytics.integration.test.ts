import { describe, it, expect } from "vitest"
import { isServerAvailable, getDiscovered } from "./setup-integration"
import { apiFetch, assertResponseTime } from "./helpers"

describe("User Analytics — Integration", () => {
  it("GET /api/analytics/cards/:cardId/summary returns summary", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data, responseTime } = await apiFetch<Record<string, unknown>>(
      `/api/analytics/cards/${cardId}/summary`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
    assertResponseTime(responseTime)
  })

  it("GET /api/analytics/cards/:cardId/by-date returns date data", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/analytics/cards/${cardId}/by-date`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("date range filter returns data", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/analytics/cards/${cardId}/by-date?start_date=2024-01-01&end_date=2024-12-31`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("empty date range returns empty or valid response", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/analytics/cards/${cardId}/by-date?start_date=2020-01-01&end_date=2020-01-02`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })
})
