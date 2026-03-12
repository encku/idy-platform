import { describe, it, expect } from "vitest"

describe("usePaginatedQuery", () => {
  it("module exports usePaginatedQuery function", async () => {
    const mod = await import("@/lib/hooks/use-paginated-query")
    expect(mod.usePaginatedQuery).toBeDefined()
    expect(typeof mod.usePaginatedQuery).toBe("function")
  })

  it("mocked hook returns expected shape", async () => {
    // Uses the globally mocked version
    const { usePaginatedQuery } = await import(
      "@/lib/hooks/use-paginated-query"
    )
    const result = usePaginatedQuery({ url: "/api/test" })

    expect(result).toHaveProperty("data")
    expect(result).toHaveProperty("total")
    expect(result).toHaveProperty("page")
    expect(result).toHaveProperty("totalPages")
    expect(result).toHaveProperty("loading")
    expect(result).toHaveProperty("search")
    expect(result).toHaveProperty("setPage")
    expect(result).toHaveProperty("setSearch")
    expect(result).toHaveProperty("refetch")
    expect(Array.isArray(result.data)).toBe(true)
    expect(typeof result.page).toBe("number")
  })
})
