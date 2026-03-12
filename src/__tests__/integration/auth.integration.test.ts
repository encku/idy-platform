import { describe, it, expect, beforeEach } from "vitest"
import { isServerAvailable } from "./setup-integration"
import {
  apiFetch,
  unauthenticatedFetch,
  assertValidId,
  assertResponseTime,
} from "./helpers"

describe("Auth — Integration", () => {
  beforeEach(() => {
    if (!isServerAvailable()) return
  })

  it("GET /api/auth/me returns current user", async () => {
    if (!isServerAvailable()) return
    const { status, data, responseTime } = await apiFetch<{
      id: number
      name: string
      email: string
    }>("/api/auth/me")

    expect(status).toBe(200)
    assertValidId(data.id)
    expect(typeof data.name).toBe("string")
    expect(typeof data.email).toBe("string")
    expect(data.email).toContain("@")
    assertResponseTime(responseTime)
  })

  it("GET /api/auth/me has correct shape", async () => {
    if (!isServerAvailable()) return
    const { data } = await apiFetch<Record<string, unknown>>("/api/auth/me")

    expect(data).toHaveProperty("id")
    expect(data).toHaveProperty("name")
    expect(data).toHaveProperty("email")
  })

  it("GET /api/user returns user profile", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<{ id: number; name: string }>(
      "/api/user"
    )

    expect(status).toBe(200)
    expect(data).toHaveProperty("id")
    expect(data).toHaveProperty("name")
  })

  it("GET /api/user/features returns features", async () => {
    if (!isServerAvailable()) return
    const { status, data } = await apiFetch<Record<string, unknown>>(
      "/api/user/features"
    )

    expect(status).toBe(200)
    expect(data).toBeDefined()
  })

  it("GET /api/auth/me without cookies returns 401", async () => {
    if (!isServerAvailable()) return
    const { status } = await unauthenticatedFetch("/api/auth/me")

    expect(status).toBe(401)
  })
})
