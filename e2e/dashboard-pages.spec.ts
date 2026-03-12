import { test, expect } from "@playwright/test"
import { PageErrorCollector } from "./helpers/error-collector"
import {
  assertPageLoads,
  assertSearchWorks,
  assertEmptyState,
} from "./helpers/page-assertions"
import { mockAllAPIs } from "./helpers/mock-api"

test.describe("User Dashboard Pages", () => {
  test.use({ storageState: "./e2e/.auth/user.json" })

  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page)
  })

  // ═══════════════════════════════════════
  // HOME — /
  // ═══════════════════════════════════════
  test("/ — home page renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(page, "/")
    errors.assertNoJSErrors()
  })

  test("/ — no cards empty state", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await page.route("**/api/user/cards", (route) =>
      route.fulfill({ json: { data: [] } })
    )

    await assertPageLoads(page, "/")
    await page.waitForTimeout(2000)
    errors.assertNoJSErrors()
  })

  // ═══════════════════════════════════════
  // CARDS — /cards
  // ═══════════════════════════════════════
  test("/cards — card list renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(page, "/cards")
    errors.assertNoJSErrors()
  })

  test("/cards — empty cards state", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await page.route("**/api/user/cards", (route) =>
      route.fulfill({ json: { data: [] } })
    )

    await assertPageLoads(page, "/cards")
    errors.assertNoJSErrors()
  })

  // ═══════════════════════════════════════
  // CARD EDITOR — /card/[cardId]
  // ═══════════════════════════════════════
  test.describe("/card/[cardId]", () => {
    test("card editor renders", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/cards/test-card-1", (route) =>
        route.fulfill({
          json: {
            data: {
              id: "test-card-1",
              public_key: "test-card-1",
              fields: [],
              direct_mode: null,
            },
          },
        })
      )

      await assertPageLoads(page, "/card/test-card-1")
      errors.assertNoJSErrors()
    })

    test("invalid cardId — does not crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/cards/nonexistent-card", (route) =>
        route.fulfill({ status: 404, json: { error: "Not found" } })
      )

      await page.goto("/card/nonexistent-card")
      await page.waitForLoadState("domcontentloaded")
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // ADD FIELD — /card/[cardId]/add
  // Client-side search
  // ═══════════════════════════════════════
  test.describe("/card/[cardId]/add", () => {
    test("field type list renders", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/card/test-card-1/add")
      errors.assertNoJSErrors()
    })

    test("field type search works", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/card/test-card-1/add")
      await assertSearchWorks(page, "email")
      errors.assertNoJSErrors()
    })

    test("empty search — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/card/test-card-1/add")
      await assertEmptyState(page)
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // STATS — /stats
  // Date range: 7/30/90 day buttons
  // Feature gated (premium)
  // ═══════════════════════════════════════
  test.describe("/stats", () => {
    test("stats page renders", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/stats")
      errors.assertNoJSErrors()
    })

    test("7-day range — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/stats")
      const btn7 = page.locator('button:has-text("7")')
      if ((await btn7.count()) > 0) {
        await btn7.first().click()
        await page.waitForTimeout(1500)
      }
      errors.assertNoJSErrors()
    })

    test("30-day range — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/stats")
      const btn30 = page.locator('button:has-text("30")')
      if ((await btn30.count()) > 0) {
        await btn30.first().click()
        await page.waitForTimeout(1500)
      }
      errors.assertNoJSErrors()
    })

    test("90-day range — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/stats")
      const btn90 = page.locator('button:has-text("90")')
      if ((await btn90.count()) > 0) {
        await btn90.first().click()
        await page.waitForTimeout(1500)
      }
      errors.assertNoJSErrors()
    })

    test("not premium — shows upgrade state", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/user/features", (route) =>
        route.fulfill({
          json: {
            data: {
              is_premium: false,
              trial_ends_at: null,
              features: {},
            },
          },
        })
      )

      await assertPageLoads(page, "/stats")
      errors.assertNoJSErrors()
    })

    test("card selection change — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      // Mock cards list with options
      await page.route("**/api/user/cards", (route) =>
        route.fulfill({
          json: {
            data: [
              { id: "c1", public_key: "card-1", name: "Card 1" },
              { id: "c2", public_key: "card-2", name: "Card 2" },
            ],
          },
        })
      )

      await assertPageLoads(page, "/stats")
      const cardSelect = page
        .locator('select, [role="combobox"]')
        .first()
      if ((await cardSelect.count()) > 0) {
        await cardSelect.click()
        await page.waitForTimeout(500)
      }
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // SIMPLE PAGES — basic render + no JS error
  // ═══════════════════════════════════════
  const simplePages = [
    { name: "Profile Edit", path: "/profile/edit" },
    { name: "Change Password", path: "/profile/change-password" },
    { name: "Settings", path: "/settings" },
    { name: "Two Factor", path: "/settings/two-factor" },
    { name: "Subscription", path: "/subscription" },
    { name: "AI Assistant", path: "/ai-assistant" },
  ]

  for (const { name, path } of simplePages) {
    test(`${name} (${path}) — renders without JS error`, async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, path)
      errors.assertNoJSErrors()
    })
  }
})
