import { describe, it, expect } from "vitest"

describe("useDebouncedSearch", () => {
  it("module exports useDebouncedSearch function", async () => {
    const mod = await import("@/lib/hooks/use-debounced-search")
    expect(mod.useDebouncedSearch).toBeDefined()
    expect(typeof mod.useDebouncedSearch).toBe("function")
  })

  it("mocked hook returns expected shape", async () => {
    const { useDebouncedSearch } = await import(
      "@/lib/hooks/use-debounced-search"
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (useDebouncedSearch as any)()
    expect(result).toHaveProperty("search")
    expect(result).toHaveProperty("debouncedSearch")
    expect(result).toHaveProperty("setSearch")
    expect(typeof result.search).toBe("string")
  })
})
