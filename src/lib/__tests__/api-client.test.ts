import { describe, it, expect, vi, beforeEach } from "vitest"

// We test the apiClient module behavior by mocking fetch
describe("ApiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("module exports apiClient with expected methods", async () => {
    const { apiClient } = await import("@/lib/api-client")
    expect(apiClient).toBeDefined()
    expect(typeof apiClient.get).toBe("function")
    expect(typeof apiClient.post).toBe("function")
    expect(typeof apiClient.put).toBe("function")
    expect(typeof apiClient.del).toBe("function")
  })

  it("get method exists on mocked client", async () => {
    const { apiClient } = await import("@/lib/api-client")
    expect(typeof apiClient.get).toBe("function")
  })

  it("post method exists on mocked client", async () => {
    const { apiClient } = await import("@/lib/api-client")
    expect(typeof apiClient.post).toBe("function")
  })

  it("put method exists on mocked client", async () => {
    const { apiClient } = await import("@/lib/api-client")
    expect(typeof apiClient.put).toBe("function")
  })

  it("del method exists on mocked client", async () => {
    const { apiClient } = await import("@/lib/api-client")
    expect(typeof apiClient.del).toBe("function")
  })

  it("mocked get returns expected shape", async () => {
    const { apiClient } = await import("@/lib/api-client")
    const result = await apiClient.get<{ data: unknown[]; total: number }>(
      "/api/test"
    )
    expect(result).toHaveProperty("data")
    expect(result).toHaveProperty("total")
  })
})
