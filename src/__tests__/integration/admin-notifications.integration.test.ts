import { describe, it, expect } from "vitest"
import { isServerAvailable, getDiscovered } from "./setup-integration"
import {
  apiFetch,
  assertPaginatedResponse,
  assertResponseTime,
  type PaginatedResponse,
} from "./helpers"

describe("Admin Notifications — Integration", () => {
  it("GET /api/admin/notifications returns list", async () => {
    if (!isServerAvailable()) return
    const { status, data, responseTime } =
      await apiFetch<PaginatedResponse>("/api/admin/notifications")

    expect(status).toBe(200)
    assertPaginatedResponse(data)
    assertResponseTime(responseTime)
  })

  it("GET /api/admin/notifications/logs returns logs", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<unknown>(
      "/api/admin/notifications/logs"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/notifications/:userId/logs returns user logs", async () => {
    if (!isServerAvailable()) return
    const userId = getDiscovered("userId")
    if (!userId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/admin/notifications/user/${userId}/logs`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/notifications/user/:userId/devices returns devices", async () => {
    if (!isServerAvailable()) return
    const userId = getDiscovered("userId")
    if (!userId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/admin/notifications/user/${userId}/devices`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("pagination on notifications list", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse>(
        "/api/admin/notifications?page=1&limit=5"
      )

    assertPaginatedResponse(data)
    expect(data.data.length).toBeLessThanOrEqual(5)
  })

  it("response time under 5 seconds", async () => {
    if (!isServerAvailable()) return
    const { responseTime } = await apiFetch("/api/admin/notifications?limit=5")

    assertResponseTime(responseTime)
  })
})
