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

interface AdminUser {
  id: number
  name: string
  email: string
  role_name: string
  card_count: number
  is_hidden: boolean
}

describe("Admin Users — Integration", () => {
  it("GET /api/admin/users returns paginated list", async () => {
    if (!isServerAvailable()) return
    const { status, data, responseTime } =
      await apiFetch<PaginatedResponse<AdminUser>>("/api/admin/users")

    expect(status).toBe(200)
    assertPaginatedResponse(data)
    assertResponseTime(responseTime)

    // Auto-discover first user ID for later tests
    if (data.data.length > 0) {
      setDiscovered("userId", data.data[0].id)
    }
  })

  it("response shape — every user has required fields", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse<AdminUser>>("/api/admin/users?limit=5")

    if (data.data.length > 0) {
      assertFieldOnAll(data.data, "id")
      assertFieldOnAll(data.data, "name")
      assertFieldOnAll(data.data, "email")
      assertFieldOnAll(data.data, "role_name")

      for (const user of data.data) {
        assertValidId(user.id)
        expect(typeof user.name).toBe("string")
        expect(user.email).toContain("@")
        expect(typeof user.role_name).toBe("string")
      }
    }
  })

  it("?page=1&limit=5 returns at most 5 items", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse<AdminUser>>(
        "/api/admin/users?page=1&limit=5"
      )

    assertPaginatedResponse(data)
    expect(data.data.length).toBeLessThanOrEqual(5)
  })

  it("?page=2&limit=5 returns different items than page 1", async () => {
    if (!isServerAvailable()) return
    const { data: page1 } =
      await apiFetch<PaginatedResponse<AdminUser>>(
        "/api/admin/users?page=1&limit=5"
      )
    const { data: page2 } =
      await apiFetch<PaginatedResponse<AdminUser>>(
        "/api/admin/users?page=2&limit=5"
      )

    assertPaginatedResponse(page1)
    assertPaginatedResponse(page2)

    if (page1.total > 5) {
      assertDifferentPages(page1.data, page2.data)
    }
  })

  it("?search= filters results", async () => {
    if (!isServerAvailable()) return
    // First get a name to search for
    const { data: all } =
      await apiFetch<PaginatedResponse<AdminUser>>(
        "/api/admin/users?limit=1"
      )

    if (all.data.length > 0) {
      const term = all.data[0].name.split(" ")[0]
      const { data: filtered } =
        await apiFetch<PaginatedResponse<AdminUser>>(
          `/api/admin/users?search=${encodeURIComponent(term)}`
        )

      assertPaginatedResponse(filtered)
      expect(filtered.total).toBeGreaterThanOrEqual(1)
    }
  })

  it("?search=xyznonexistent returns empty", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse<AdminUser>>(
        "/api/admin/users?search=xyznonexistent99999"
      )

    assertPaginatedResponse(data)
    expect(data.data.length).toBe(0)
    expect(data.total).toBe(0)
  })

  it("?order_by=asc and desc return different order", async () => {
    if (!isServerAvailable()) return
    const { data: asc } =
      await apiFetch<PaginatedResponse<AdminUser>>(
        "/api/admin/users?limit=5&order_by=asc"
      )
    const { data: desc } =
      await apiFetch<PaginatedResponse<AdminUser>>(
        "/api/admin/users?limit=5&order_by=desc"
      )

    if (asc.data.length > 1 && desc.data.length > 1) {
      // First item should differ unless there's only 1 item
      expect(asc.data[0].id).not.toBe(desc.data[0].id)
    }
  })

  it("?limit=1 returns exactly 1 item", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse<AdminUser>>(
        "/api/admin/users?limit=1"
      )

    assertPaginatedResponse(data)
    if (data.total > 0) {
      expect(data.data.length).toBe(1)
    }
  })

  it("GET /api/admin/users/:userId returns user detail", async () => {
    if (!isServerAvailable()) return
    const userId = getDiscovered("userId")
    if (!userId) return

    const { status, data } = await apiFetch<{
      id: number
      name: string
      email: string
      inserted_at: string
    }>(`/api/admin/users/${userId}`)

    expect(status).toBe(200)
    assertValidId(data.id)
    expect(data.id).toBe(userId)
    expect(typeof data.name).toBe("string")
    expect(typeof data.email).toBe("string")
  })

  it("GET /api/admin/users/:userId/cards returns user cards", async () => {
    if (!isServerAvailable()) return
    const userId = getDiscovered("userId")
    if (!userId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/admin/users/${userId}/cards`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/users/999999 returns 404 or error", async () => {
    if (!isServerAvailable()) return
    const { status } = await apiFetch("/api/admin/users/999999")

    expect([404, 400, 500]).toContain(status)
  })

  it("response time under 5 seconds", async () => {
    if (!isServerAvailable()) return
    const { responseTime } = await apiFetch("/api/admin/users?limit=10")

    assertResponseTime(responseTime)
  })
})
