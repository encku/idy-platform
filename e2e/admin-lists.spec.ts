import { test } from "@playwright/test"
import { PageErrorCollector } from "./helpers/error-collector"
import { APIInterceptor } from "./helpers/api-interceptor"
import {
  assertPageLoads,
  assertPaginationWorks,
  assertSearchWorks,
  assertEmptyState,
} from "./helpers/page-assertions"
import { mockAllAPIs } from "./helpers/mock-api"

test.describe("Admin List Pages", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" })

  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page)
  })

  // ═══════════════════════════════════════
  // ADMIN USERS — /admin/users
  // Query: page, limit, search, role filter
  // ═══════════════════════════════════════
  test.describe("/admin/users", () => {
    test("page loads with table", async ({ page }) => {
      const errors = new PageErrorCollector()
      const api = new APIInterceptor()
      errors.attach(page)
      api.attach(page)

      await assertPageLoads(page, "/admin/users")
      api.assertPaginatedResponse("/api/admin/users")
      errors.assertNoJSErrors()
    })

    test("search works", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      await assertSearchWorks(page, "test")
      errors.assertNoJSErrors()
    })

    test("empty search — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      await assertEmptyState(page)
      errors.assertNoJSErrors()
    })

    test("pagination works", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      await assertPaginationWorks(page)
      errors.assertNoJSErrors()
    })

    test("role filter interaction — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      const roleFilter = page
        .locator('select, [role="combobox"], button:has-text("Role")')
        .first()
      if ((await roleFilter.count()) > 0) {
        await roleFilter.click()
        await page.waitForTimeout(300)
      }
      errors.assertNoJSErrors()
    })

    test("search + pagination combined", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/users")
      await assertSearchWorks(page, "a")
      await page.waitForTimeout(500)
      await assertPaginationWorks(page)
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // ADMIN CARDS — /admin/cards
  // Query: page, limit, search
  // ═══════════════════════════════════════
  test.describe("/admin/cards", () => {
    test("page loads with table", async ({ page }) => {
      const errors = new PageErrorCollector()
      const api = new APIInterceptor()
      errors.attach(page)
      api.attach(page)

      await assertPageLoads(page, "/admin/cards")
      api.assertPaginatedResponse("/api/admin/cards")
      errors.assertNoJSErrors()
    })

    test("search works", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/cards")
      await assertSearchWorks(page, "test-card")
      errors.assertNoJSErrors()
    })

    test("empty search — empty state", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/cards")
      await assertEmptyState(page)
      errors.assertNoJSErrors()
    })

    test("pagination works", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/cards")
      await assertPaginationWorks(page)
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // ADMIN COMPANIES — /admin/companies
  // Query: page, limit, search
  // ═══════════════════════════════════════
  test.describe("/admin/companies", () => {
    test("page loads", async ({ page }) => {
      const errors = new PageErrorCollector()
      const api = new APIInterceptor()
      errors.attach(page)
      api.attach(page)

      await assertPageLoads(page, "/admin/companies")
      api.assertPaginatedResponse("/api/admin/companies")
      errors.assertNoJSErrors()
    })

    test("search works", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/companies")
      await assertSearchWorks(page, "test-company")
      errors.assertNoJSErrors()
    })

    test("pagination works", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/companies")
      await assertPaginationWorks(page)
      errors.assertNoJSErrors()
    })

    test("empty search — empty state", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/companies")
      await assertEmptyState(page)
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // ADMIN SUBSCRIPTIONS — /admin/subscriptions
  // Query: page, limit, search, status filter
  // ═══════════════════════════════════════
  test.describe("/admin/subscriptions", () => {
    test("page loads with stats + table", async ({ page }) => {
      const errors = new PageErrorCollector()
      const api = new APIInterceptor()
      errors.attach(page)
      api.attach(page)

      await assertPageLoads(page, "/admin/subscriptions")
      api.assertPaginatedResponse("/api/admin/subscriptions")
      errors.assertNoJSErrors()
    })

    test("status filter — active", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/subscriptions")
      const activeBtn = page.locator(
        'button:has-text("Active"), button:has-text("Aktif")'
      )
      if ((await activeBtn.count()) > 0) {
        await activeBtn.first().click()
        await page.waitForTimeout(500)
      }
      errors.assertNoJSErrors()
    })

    test("status filter — expired", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/subscriptions")
      const expiredBtn = page.locator(
        'button:has-text("Expired"), button:has-text("Süresi")'
      )
      if ((await expiredBtn.count()) > 0) {
        await expiredBtn.first().click()
        await page.waitForTimeout(500)
      }
      errors.assertNoJSErrors()
    })

    test("search works", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/subscriptions")
      await assertSearchWorks(page, "user")
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // ADMIN AD SYNC — /admin/ad-sync
  // Query: page, limit, search (feature gated)
  // ═══════════════════════════════════════
  test.describe("/admin/ad-sync", () => {
    test("page loads (feature gate included)", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.goto("/admin/ad-sync")
      await page.waitForLoadState("domcontentloaded")
      errors.assertNoJSErrors()
    })

    test("search works", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.goto("/admin/ad-sync")
      await page.waitForLoadState("domcontentloaded")
      await assertSearchWorks(page, "connection")
      errors.assertNoJSErrors()
    })
  })
})
