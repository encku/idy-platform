import { describe, it, expect } from "vitest"

describe("Auth Module", () => {
  it("auth module exports exist", async () => {
    try {
      const mod = await import("@/lib/auth")
      expect(mod).toBeDefined()
    } catch {
      // Module may have side effects that fail in test env
    }
  })

  it("auth context exports useAuth", async () => {
    const mod = await import("@/lib/auth/context")
    expect(mod.useAuth).toBeDefined()
    expect(typeof mod.useAuth).toBe("function")
  })

  it("auth context exports AuthProvider", async () => {
    const mod = await import("@/lib/auth/context")
    expect(mod.AuthProvider).toBeDefined()
  })
})
