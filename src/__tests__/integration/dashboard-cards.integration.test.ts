import { describe, it, expect } from "vitest"
import { isServerAvailable, getDiscovered } from "./setup-integration"
import { apiFetch, assertValidId, assertResponseTime } from "./helpers"

interface CardField {
  id: number
  name: string
  data: string
  is_active: boolean
  order_number: number
}

describe("Dashboard Cards — Integration", () => {
  it("GET /api/user returns current user with cards info", async () => {
    if (!isServerAvailable()) return
    const { status, data, responseTime } = await apiFetch<{
      id: number
      name: string
    }>("/api/user")

    expect(status).toBe(200)
    assertValidId(data.id)
    expect(typeof data.name).toBe("string")
    assertResponseTime(responseTime)
  })

  it("GET /api/user/features returns user features", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<Record<string, unknown>>(
      "/api/user/features"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/cards/:cardId/fields returns card fields", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<
      CardField[] | { data: CardField[] }
    >(`/api/cards/${cardId}/fields`)

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("card fields have correct shape", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { data } = await apiFetch<CardField[] | { data: CardField[] }>(
      `/api/cards/${cardId}/fields`
    )

    const fields = Array.isArray(data) ? data : data?.data
    if (Array.isArray(fields) && fields.length > 0) {
      for (const field of fields.slice(0, 5)) {
        assertValidId(field.id)
        expect(typeof field.name).toBe("string")
        expect(typeof field.is_active).toBe("boolean")
        expect(typeof field.order_number).toBe("number")
      }
    }
  })

  it("GET /api/user/card-profile/:cardId returns profile", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<Record<string, unknown>>(
      `/api/user/card-profile/${cardId}`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("response time for card fields under 5 seconds", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { responseTime } = await apiFetch(`/api/cards/${cardId}/fields`)

    assertResponseTime(responseTime)
  })
})
