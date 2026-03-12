import { describe, it, expect } from "vitest"
import { isServerAvailable, setDiscovered, getDiscovered } from "./setup-integration"
import {
  apiFetch,
  assertPaginatedResponse,
  assertFieldOnAll,
  assertValidId,
  assertResponseTime,
  assertDifferentPages,
  type PaginatedResponse,
} from "./helpers"

interface AdminCard {
  card_id: number
  user_id: number
  user_name: string
  user_email: string
  card_public_key: string
  card_user_preferred_name: string
  card_is_hidden: boolean
  merge_id: number | null
}

interface AdminCardField {
  id: number
  name: string
  data: string
  is_active: boolean
  order_number: number
  field_type: { name: string; icon_url: string }
}

describe("Admin Cards — Integration", () => {
  it("GET /api/admin/cards returns paginated list", async () => {
    if (!isServerAvailable()) return
    const { status, data, responseTime } =
      await apiFetch<PaginatedResponse<AdminCard>>("/api/admin/cards")

    expect(status).toBe(200)
    assertPaginatedResponse(data)
    assertResponseTime(responseTime)

    if (data.data.length > 0) {
      setDiscovered("cardId", data.data[0].card_id)
      setDiscovered("cardPublicKey", data.data[0].card_public_key)
    }
  })

  it("response shape — every card has required fields", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse<AdminCard>>("/api/admin/cards?limit=5")

    if (data.data.length > 0) {
      assertFieldOnAll(data.data, "card_id")
      assertFieldOnAll(data.data, "user_name")
      assertFieldOnAll(data.data, "card_public_key")

      for (const card of data.data) {
        expect(typeof card.card_id).toBe("number")
        expect(typeof card.card_public_key).toBe("string")
        expect(card.card_public_key.length).toBeGreaterThan(0)
      }
    }
  })

  it("?page=1&limit=5 returns at most 5 items", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse<AdminCard>>(
        "/api/admin/cards?page=1&limit=5"
      )

    assertPaginatedResponse(data)
    expect(data.data.length).toBeLessThanOrEqual(5)
  })

  it("?page=2 returns different items than page 1", async () => {
    if (!isServerAvailable()) return
    const { data: page1 } =
      await apiFetch<PaginatedResponse<AdminCard>>(
        "/api/admin/cards?page=1&limit=5"
      )
    const { data: page2 } =
      await apiFetch<PaginatedResponse<AdminCard>>(
        "/api/admin/cards?page=2&limit=5"
      )

    if (page1.total > 5) {
      assertDifferentPages(
        page1.data.map((c) => ({ ...c, id: c.card_id })),
        page2.data.map((c) => ({ ...c, id: c.card_id }))
      )
    }
  })

  it("?search= filters results", async () => {
    if (!isServerAvailable()) return
    const { data: all } =
      await apiFetch<PaginatedResponse<AdminCard>>(
        "/api/admin/cards?limit=1"
      )

    if (all.data.length > 0) {
      const term = all.data[0].user_name.split(" ")[0]
      const { data: filtered } =
        await apiFetch<PaginatedResponse<AdminCard>>(
          `/api/admin/cards?search=${encodeURIComponent(term)}`
        )

      assertPaginatedResponse(filtered)
      expect(filtered.total).toBeGreaterThanOrEqual(1)
    }
  })

  it("?search=nonexistent returns empty", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse<AdminCard>>(
        "/api/admin/cards?search=xyznonexistent99999"
      )

    assertPaginatedResponse(data)
    expect(data.data.length).toBe(0)
  })

  it("GET /api/admin/cards/:cardId returns card detail with fields", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<
      AdminCard & { fields: AdminCardField[] }
    >(`/api/admin/cards/${cardId}`)

    expect(status).toBe(200)
    expect(data.card_id).toBe(cardId)
    expect(Array.isArray(data.fields)).toBe(true)
  })

  it("card detail fields have correct shape", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { data } = await apiFetch<{ fields: AdminCardField[] }>(
      `/api/admin/cards/${cardId}`
    )

    if (data.fields.length > 0) {
      for (const field of data.fields) {
        assertValidId(field.id)
        expect(typeof field.name).toBe("string")
        expect(typeof field.is_active).toBe("boolean")
        expect(typeof field.order_number).toBe("number")
        expect(field.field_type).toHaveProperty("name")
      }
    }
  })

  it("GET /api/admin/cards/:cardId/merge/available returns list", async () => {
    if (!isServerAvailable()) return
    const cardId = getDiscovered("cardId")
    if (!cardId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/admin/cards/${cardId}/merge/available`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/cards/999999 returns error", async () => {
    if (!isServerAvailable()) return
    const { status } = await apiFetch("/api/admin/cards/999999")

    expect([404, 400, 500]).toContain(status)
  })

  it("pagination consistency — total >= data.length", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse<AdminCard>>(
        "/api/admin/cards?page=1&limit=10"
      )

    assertPaginatedResponse(data)
  })

  it("response time under 5 seconds", async () => {
    if (!isServerAvailable()) return
    const { responseTime } = await apiFetch("/api/admin/cards?limit=10")

    assertResponseTime(responseTime)
  })
})
