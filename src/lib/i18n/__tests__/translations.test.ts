import { describe, it, expect } from "vitest"

describe("i18n Translations", () => {
  it("en.ts and tr.ts have matching keys", async () => {
    // Unmock to get real translation files
    const { default: en } = await import("@/lib/i18n/en")
    const { default: tr } = await import("@/lib/i18n/tr")

    const enKeys = Object.keys(en).sort()
    const trKeys = Object.keys(tr).sort()

    // Find missing keys
    const missingInTr = enKeys.filter((key) => !trKeys.includes(key))
    const missingInEn = trKeys.filter((key) => !enKeys.includes(key))

    if (missingInTr.length > 0) {
      console.warn("Keys missing in tr.ts:", missingInTr)
    }
    if (missingInEn.length > 0) {
      console.warn("Keys missing in en.ts:", missingInEn)
    }

    // Both dictionaries should have the same keys
    expect(missingInTr, "Keys in en.ts missing from tr.ts").toEqual([])
    expect(missingInEn, "Keys in tr.ts missing from en.ts").toEqual([])
  })

  it("en.ts has no empty values", async () => {
    const { default: en } = await import("@/lib/i18n/en")
    const emptyKeys = Object.entries(en)
      .filter(([, value]) => value === "")
      .map(([key]) => key)

    expect(emptyKeys, "en.ts has empty translation values").toEqual([])
  })

  it("tr.ts has no empty values", async () => {
    const { default: tr } = await import("@/lib/i18n/tr")
    const emptyKeys = Object.entries(tr)
      .filter(([, value]) => value === "")
      .map(([key]) => key)

    expect(emptyKeys, "tr.ts has empty translation values").toEqual([])
  })

  it("i18n context exports useTranslation", async () => {
    const mod = await import("@/lib/i18n/context")
    expect(mod.useTranslation).toBeDefined()
    expect(typeof mod.useTranslation).toBe("function")
  })

  it("i18n context exports I18nProvider", async () => {
    const mod = await import("@/lib/i18n/context")
    expect(mod.I18nProvider).toBeDefined()
  })
})
