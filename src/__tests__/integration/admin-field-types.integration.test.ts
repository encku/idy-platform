import { describe, it, expect } from "vitest"
import { isServerAvailable, setDiscovered, getDiscovered } from "./setup-integration"
import { apiFetch, assertValidId, assertResponseTime } from "./helpers"

interface FieldType {
  id: number
  name: string
  icon_url: string
  [key: string]: unknown
}

describe("Admin Field Types — Integration", () => {
  it("GET /api/admin/field-types returns list", async () => {
    if (!isServerAvailable()) return
    const { status, data, responseTime } = await apiFetch<
      FieldType[] | { data: FieldType[] }
    >("/api/admin/field-types")

    expect(status).toBe(200)
    assertResponseTime(responseTime)

    const items = Array.isArray(data) ? data : data.data
    expect(Array.isArray(items)).toBe(true)

    if (items.length > 0) {
      setDiscovered("fieldTypeId", items[0].id)
    }
  })

  it("field types have correct shape", async () => {
    if (!isServerAvailable()) return
    const { data } = await apiFetch<FieldType[] | { data: FieldType[] }>(
      "/api/admin/field-types"
    )

    const items = Array.isArray(data) ? data : data.data
    if (items.length > 0) {
      for (const ft of items.slice(0, 5)) {
        assertValidId(ft.id)
        expect(typeof ft.name).toBe("string")
        expect(ft.name.length).toBeGreaterThan(0)
      }
    }
  })

  it("GET /api/admin/field-types/groups returns grouped types", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<unknown>(
      "/api/admin/field-types/groups"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/admin/field-types/:id returns single type", async () => {
    if (!isServerAvailable()) return
    const fieldTypeId = getDiscovered("fieldTypeId")
    if (!fieldTypeId) return

    const { status, data } = await apiFetch<FieldType>(
      `/api/admin/field-types/${fieldTypeId}`
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
    assertValidId(data.id)
  })
})
