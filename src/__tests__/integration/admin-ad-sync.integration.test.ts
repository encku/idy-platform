import { describe, it, expect } from "vitest"
import { isServerAvailable, setDiscovered, getDiscovered } from "./setup-integration"
import { apiFetch, assertResponseTime } from "./helpers"

describe("Admin AD Sync — Integration", () => {
  it("GET /api/admin/ad-sync/connections returns list", async () => {
    if (!isServerAvailable()) return
    const { status, data, responseTime } = await apiFetch<
      unknown[] | { data: unknown[] }
    >("/api/admin/ad-sync/connections")

    expect(status).toBe(200)
    assertResponseTime(responseTime)

    const items = Array.isArray(data) ? data : (data as { data: unknown[] }).data
    if (Array.isArray(items) && items.length > 0) {
      const first = items[0] as { id: number }
      if (first.id) {
        setDiscovered("adConnectionId", first.id)
      }
    }
  })

  it("connections shape validation", async () => {
    if (!isServerAvailable()) return
    const { data } = await apiFetch<unknown[] | { data: unknown[] }>(
      "/api/admin/ad-sync/connections"
    )

    const items = Array.isArray(data) ? data : (data as { data: unknown[] }).data
    if (Array.isArray(items) && items.length > 0) {
      const first = items[0] as Record<string, unknown>
      expect(first).toHaveProperty("id")
    }
  })

  it("GET /api/admin/ad-sync/connections/:id returns detail", async () => {
    if (!isServerAvailable()) return
    const connId = getDiscovered("adConnectionId")
    if (!connId) return

    const { status, data } = await apiFetch<Record<string, unknown>>(
      `/api/admin/ad-sync/connections/${connId}`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
    expect(data).toHaveProperty("id")
  })

  it("GET /api/admin/ad-sync/connections/:id/mappings returns mappings", async () => {
    if (!isServerAvailable()) return
    const connId = getDiscovered("adConnectionId")
    if (!connId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/admin/ad-sync/connections/${connId}/mappings`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })
})
