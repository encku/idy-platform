import { describe, it, expect } from "vitest"
import { isServerAvailable, setDiscovered, getDiscovered } from "./setup-integration"
import {
  apiFetch,
  assertPaginatedResponse,
  assertFieldOnAll,
  assertResponseTime,
  type PaginatedResponse,
} from "./helpers"

interface AdminCompany {
  id: number
  name: string
  [key: string]: unknown
}

describe("Admin Companies — Integration", () => {
  it("GET /api/admin/companies returns paginated list", async () => {
    if (!isServerAvailable()) return
    const { status, data, responseTime } =
      await apiFetch<PaginatedResponse<AdminCompany>>("/api/admin/companies")

    expect(status).toBe(200)
    assertPaginatedResponse(data)
    assertResponseTime(responseTime)

    if (data.data.length > 0) {
      setDiscovered("companyId", data.data[0].id)
    }
  })

  it("response shape — every company has id and name", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse<AdminCompany>>(
        "/api/admin/companies?limit=5"
      )

    if (data.data.length > 0) {
      assertFieldOnAll(data.data, "id")
      assertFieldOnAll(data.data, "name")
    }
  })

  it("?page=1&limit=5 returns at most 5", async () => {
    if (!isServerAvailable()) return
    const { data } =
      await apiFetch<PaginatedResponse<AdminCompany>>(
        "/api/admin/companies?page=1&limit=5"
      )

    assertPaginatedResponse(data)
    expect(data.data.length).toBeLessThanOrEqual(5)
  })

  it("?search= filters results", async () => {
    if (!isServerAvailable()) return
    const { data: all } =
      await apiFetch<PaginatedResponse<AdminCompany>>(
        "/api/admin/companies?limit=1"
      )

    if (all.data.length > 0) {
      const term = all.data[0].name.split(" ")[0]
      const { data: filtered } =
        await apiFetch<PaginatedResponse<AdminCompany>>(
          `/api/admin/companies?search=${encodeURIComponent(term)}`
        )

      assertPaginatedResponse(filtered)
      expect(filtered.total).toBeGreaterThanOrEqual(1)
    }
  })

  it("GET /api/admin/companies/:companyId returns detail", async () => {
    if (!isServerAvailable()) return
    const companyId = getDiscovered("companyId")
    if (!companyId) return

    const { status, data } = await apiFetch<AdminCompany>(
      `/api/admin/companies/${companyId}`
    )

    expect(status).toBe(200)
    expect(data.id).toBe(companyId)
    expect(typeof data.name).toBe("string")
  })

  it("GET /api/admin/companies/:companyId/features returns features", async () => {
    if (!isServerAvailable()) return
    const companyId = getDiscovered("companyId")
    if (!companyId) return

    const { status, data } = await apiFetch<unknown>(
      `/api/admin/companies/${companyId}/features`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/companies/card-assignment returns list", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<unknown>(
      "/api/admin/companies/card-assignment"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/companies/user-assignment returns list", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<unknown>(
      "/api/admin/companies/user-assignment"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/companies/my-features returns features", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<unknown>(
      "/api/admin/companies/my-features"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/companies/999999 returns error", async () => {
    if (!isServerAvailable()) return
    const { status } = await apiFetch("/api/admin/companies/999999")

    expect([404, 400, 500]).toContain(status)
  })
})
