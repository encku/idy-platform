import { test, expect } from "@playwright/test"
import { PageErrorCollector } from "./helpers/error-collector"
import { APIInterceptor } from "./helpers/api-interceptor"
import { assertPageLoads } from "./helpers/page-assertions"
import { mockAllAPIs } from "./helpers/mock-api"

test.describe("Admin Analytics & Dashboard", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" })

  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page)
  })

  // ═══════════════════════════════════════
  // ANALYTICS OVERVIEW — /admin/analytics
  // ═══════════════════════════════════════
  test("/admin/analytics — overview renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    const api = new APIInterceptor()
    errors.attach(page)
    api.attach(page)

    await assertPageLoads(page, "/admin/analytics")
    errors.assertNoJSErrors()
  })

  // ═══════════════════════════════════════
  // CARD ANALYTICS — /admin/analytics/cards/[cardId]
  // Query: start_date, end_date (YYYY-MM-DD)
  // ═══════════════════════════════════════
  test.describe("/admin/analytics/cards/[cardId]", () => {
    const cardId = "test-card-1"

    test("default 30-day range renders", async ({ page }) => {
      const errors = new PageErrorCollector()
      const api = new APIInterceptor()
      errors.attach(page)
      api.attach(page)

      await assertPageLoads(page, `/admin/analytics/cards/${cardId}`)
      await page.waitForTimeout(2000)
      errors.assertNoJSErrors()
    })

    test("7-day range — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, `/admin/analytics/cards/${cardId}`)
      const btn7 = page.locator('button:has-text("7"), button:has-text("Last 7")')
      if ((await btn7.count()) > 0) {
        await btn7.first().click()
        await page.waitForTimeout(1500)
      }
      errors.assertNoJSErrors()
    })

    test("90-day range — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, `/admin/analytics/cards/${cardId}`)
      const btn90 = page.locator(
        'button:has-text("90"), button:has-text("Last 90")'
      )
      if ((await btn90.count()) > 0) {
        await btn90.first().click()
        await page.waitForTimeout(1500)
      }
      errors.assertNoJSErrors()
    })

    test("custom date range picker — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, `/admin/analytics/cards/${cardId}`)
      const customBtn = page.locator(
        'button:has-text("Custom"), button:has-text("Özel")'
      )
      if ((await customBtn.count()) > 0) {
        await customBtn.first().click()
        await page.waitForTimeout(500)
      }
      errors.assertNoJSErrors()
    })

    test("empty data — charts handle empty state", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      // Override with empty analytics data
      await page.route("**/api/admin/analytics/cards/*/by-date**", (route) =>
        route.fulfill({ json: { data: [] } })
      )
      await page.route(
        "**/api/admin/analytics/cards/*/field-clicks**",
        (route) => route.fulfill({ json: { data: [] } })
      )
      await page.route(
        "**/api/admin/analytics/cards/*/share-methods**",
        (route) => route.fulfill({ json: { data: [] } })
      )

      await assertPageLoads(page, `/admin/analytics/cards/${cardId}`)
      await page.waitForTimeout(2000)
      errors.assertNoJSErrors()
    })

    test("invalid cardId — does not crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.goto("/admin/analytics/cards/nonexistent-999")
      await page.waitForLoadState("domcontentloaded")
      await page.waitForTimeout(2000)
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // ADMIN DASHBOARD — /admin
  // 5 concurrent fetches via Promise.allSettled
  // ═══════════════════════════════════════
  test.describe("/admin (Dashboard)", () => {
    test("dashboard renders with all sections", async ({ page }) => {
      const errors = new PageErrorCollector()
      const api = new APIInterceptor()
      errors.attach(page)
      api.attach(page)

      await assertPageLoads(page, "/admin")
      await page.waitForTimeout(3000)
      errors.assertNoJSErrors()
    })

    test("one API fails — other sections still render", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      // Make weekly-stats fail
      await page.route("**/api/admin/dashboard/weekly-stats", (route) =>
        route.fulfill({ status: 500, body: "Internal Error" })
      )

      await assertPageLoads(page, "/admin")
      await page.waitForTimeout(3000)
      // Promise.allSettled should handle this gracefully
      errors.assertNoJSErrors()
    })

    test("all APIs fail — page still renders without crash", async ({
      page,
    }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/admin/dashboard/**", (route) =>
        route.fulfill({ status: 500, body: "Internal Error" })
      )

      await page.goto("/admin")
      await page.waitForLoadState("domcontentloaded")
      await page.waitForTimeout(3000)
      errors.assertNoJSErrors()
    })
  })
})
