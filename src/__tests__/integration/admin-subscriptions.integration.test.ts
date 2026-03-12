import { describe, it, expect } from "vitest"
import { isServerAvailable, getDiscovered } from "./setup-integration"
import {
  apiFetch,
  assertPaginatedResponse,
  assertResponseTime,
  type PaginatedResponse,
} from "./helpers"

describe("Admin Subscriptions — Integration", () => {
  it("GET /api/admin/subscriptions returns list", async () => {
    if (!isServerAvailable()) return
    const { status, data, responseTime } =
      await apiFetch<PaginatedResponse>("/api/admin/subscriptions")

    expect(status).toBe(200)
    assertPaginatedResponse(data)
    assertResponseTime(responseTime)
  })

  it("GET /api/admin/subscriptions/stats returns stats", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<Record<string, unknown>>(
      "/api/admin/subscriptions/stats"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/subscriptions/plan-changes returns changes", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<unknown>(
      "/api/admin/subscriptions/plan-changes"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/subscriptions/:userId/history returns history", async () => {
    if (!isServerAvailable()) return
    const userId = getDiscovered("userId")
    if (!userId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/admin/subscriptions/${userId}/history`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("pagination works on subscriptions", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse>(
        "/api/admin/subscriptions?page=1&limit=5"
      )

    assertPaginatedResponse(data)
    expect(data.data.length).toBeLessThanOrEqual(5)
  })

  it("response shape — subscriptions have data array", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse>("/api/admin/subscriptions?limit=3")

    assertPaginatedResponse(data)
    expect(Array.isArray(data.data)).toBe(true)
  })
})
