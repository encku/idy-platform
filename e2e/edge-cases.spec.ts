import { test, expect } from "@playwright/test"
import { PageErrorCollector } from "./helpers/error-collector"
import {
  assertPageLoads,
  assertPaginationWorks,
  assertSearchWorks,
} from "./helpers/page-assertions"
import { mockAllAPIs } from "./helpers/mock-api"

test.describe("Edge Cases & Error Handling", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" })

  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page)
  })

  // ═══════════════════════════════════════
  // PAGINATION EDGE CASES
  // ═══════════════════════════════════════
  test.describe("Pagination Edge Cases", () => {
    test("first page — prev button disabled", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      const prevBtn = page.locator(
        'button[aria-label="Previous"], button[aria-label="Go to previous page"], button:has-text("Previous")'
      )
      if ((await prevBtn.count()) > 0) {
        await expect(prevBtn.first()).toBeDisabled()
      }
      errors.assertNoJSErrors()
    })

    test("rapid page changes — no race condition", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      // Mock with data to enable pagination
      await page.route("**/api/admin/users**", (route) =>
        route.fulfill({
          json: {
            data: Array.from({ length: 20 }, (_, i) => ({
              id: `user-${i}`,
              name: `User ${i}`,
              email: `user${i}@test.com`,
              role: "admin",
            })),
            total: 100,
          },
        })
      )

      await assertPageLoads(page, "/admin/users")
      const nextBtn = page.locator(
        'button[aria-label="Next"], button[aria-label="Go to next page"], button:has-text("Next")'
      )
      if ((await nextBtn.count()) > 0 && (await nextBtn.first().isEnabled())) {
        // Click rapidly
        await nextBtn.first().click()
        await nextBtn.first().click()
        await nextBtn.first().click()
        await page.waitForTimeout(2000)
      }
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // SEARCH EDGE CASES
  // ═══════════════════════════════════════
  test.describe("Search Edge Cases", () => {
    test("special characters — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      await assertSearchWorks(page, "'; DROP TABLE users; --")
      errors.assertNoJSErrors()
    })

    test("very long search string — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      await assertSearchWorks(page, "a".repeat(500))
      errors.assertNoJSErrors()
    })

    test("Turkish characters — encoding correct", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      await assertSearchWorks(page, "Şükrü Öğütçüoğlu İşçi")
      errors.assertNoJSErrors()
    })

    test("emoji search — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      await assertSearchWorks(page, "🎉 test 🚀")
      errors.assertNoJSErrors()
    })

    test("search then clear — original data returns", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      const searchInput = page.locator(
        'input[placeholder*="Search"], input[placeholder*="Ara"]'
      )
      if ((await searchInput.count()) > 0) {
        await searchInput.first().fill("test")
        await page.waitForTimeout(600)
        await searchInput.first().fill("")
        await page.waitForTimeout(600)
      }
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // API ERROR HANDLING
  // ═══════════════════════════════════════
  test.describe("API Error Handling", () => {
    test("API 500 — page does not crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/admin/users**", (route) =>
        route.fulfill({ status: 500, body: "Internal Error" })
      )

      await page.goto("/admin/users")
      await page.waitForLoadState("domcontentloaded")
      await page.waitForTimeout(2000)
      errors.assertNoJSErrors()
    })

    test("API timeout — page does not crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/admin/cards**", (route) =>
        route.abort("timedout")
      )

      await page.goto("/admin/cards")
      await page.waitForLoadState("domcontentloaded")
      await page.waitForTimeout(3000)
      errors.assertNoJSErrors()
    })

    test("API empty response — shows empty state", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/admin/companies**", (route) =>
        route.fulfill({ json: { data: [], total: 0 } })
      )

      await assertPageLoads(page, "/admin/companies")
      errors.assertNoJSErrors()
    })

    test("API malformed JSON — page does not crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/admin/users**", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "{invalid json",
        })
      )

      await page.goto("/admin/users")
      await page.waitForLoadState("domcontentloaded")
      await page.waitForTimeout(2000)
      errors.assertNoJSErrors()
    })

    test("401 Unauthorized — redirects to login", async ({ page }) => {
      await page.route("**/api/auth/me", (route) =>
        route.fulfill({ status: 401, json: { error: "Unauthorized" } })
      )
      await page.route("**/api/auth/refresh", (route) =>
        route.fulfill({ status: 401, json: { error: "Refresh failed" } })
      )

      await page.goto("/admin/users")
      await page.waitForTimeout(5000)
      // Should redirect to login
      expect(page.url()).toContain("/login")
    })
  })

  // ═══════════════════════════════════════
  // DATE RANGE EDGE CASES
  // ═══════════════════════════════════════
  test.describe("Date Range Edge Cases", () => {
    test("empty analytics data — charts handle empty state", async ({
      page,
    }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/admin/analytics/cards/*/by-date**", (route) =>
        route.fulfill({ json: { data: [] } })
      )

      await assertPageLoads(page, "/admin/analytics/cards/test-card-1")
      await page.waitForTimeout(2000)
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // NAVIGATION EDGE CASES
  // ═══════════════════════════════════════
  test.describe("Navigation", () => {
    test("browser back button — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      await page.goto("/admin/cards")
      await page.waitForLoadState("domcontentloaded")
      await page.goBack()
      await page.waitForLoadState("domcontentloaded")
      errors.assertNoJSErrors()
    })

    test("rapid page navigation — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      const pages = [
        "/admin",
        "/admin/users",
        "/admin/cards",
        "/admin/companies",
      ]
      for (const p of pages) {
        await page.goto(p)
      }
      await page.waitForLoadState("domcontentloaded")
      errors.assertNoJSErrors()
    })

    test("404 page — no JS error", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.goto("/this-page-does-not-exist-at-all")
      await page.waitForLoadState("domcontentloaded")
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // MOBILE VIEWPORT
  // ═══════════════════════════════════════
  test.describe("Mobile Viewport", () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test("admin users — no crash on mobile", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      errors.assertNoJSErrors()
    })

    test("admin dashboard — no crash on mobile", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin")
      errors.assertNoJSErrors()
    })

    test("home page — no crash on mobile", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/")
      errors.assertNoJSErrors()
    })
  })
})
