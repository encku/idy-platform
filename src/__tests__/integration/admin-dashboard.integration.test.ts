import { describe, it, expect } from "vitest"
import { isServerAvailable } from "./setup-integration"
import { apiFetch, assertResponseTime } from "./helpers"

describe("Admin Dashboard — Integration", () => {
  it("GET /api/admin/dashboard/summary returns stats", async () => {
    if (!isServerAvailable()) return
    const { status, data, responseTime } = await apiFetch<Record<string, unknown>>(
      "/api/admin/dashboard/summary"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
    assertResponseTime(responseTime)
  })

  it("GET /api/admin/dashboard/trends returns trend data", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<unknown>(
      "/api/admin/dashboard/trends"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/dashboard/recent-activities returns activities", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<unknown>(
      "/api/admin/dashboard/recent-activities"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/dashboard/weekly-stats returns weekly data", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<unknown>(
      "/api/admin/dashboard/weekly-stats"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/dashboard/card-performance returns performance data", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<unknown>(
      "/api/admin/dashboard/card-performance"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })
})
