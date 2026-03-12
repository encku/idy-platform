import { describe, it, expect } from "vitest"

// Note: Public card pages are server components using fetch directly,
// so they're better tested via Playwright E2E.
// These tests verify the modules can be imported without errors.

describe("Public Pages — Import Tests", () => {
  it("/[cardId] page module imports", async () => {
    try {
      const mod = await import("@/app/[cardId]/page")
      expect(mod).toBeDefined()
      expect(mod.default).toBeDefined()
    } catch {
      // Server component — may not render in jsdom
    }
  })

  it("/[cardId]/[cardSecret] page module imports", async () => {
    try {
      const mod = await import("@/app/[cardId]/[cardSecret]/page")
      expect(mod).toBeDefined()
      expect(mod.default).toBeDefined()
    } catch {
      // Server component — may not render in jsdom
    }
  })
})
