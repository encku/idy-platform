import { test, expect } from "@playwright/test"
import { PageErrorCollector } from "./helpers/error-collector"
import { APIInterceptor } from "./helpers/api-interceptor"
import { assertPageLoads, assertPaginationWorks } from "./helpers/page-assertions"
import { mockAllAPIs } from "./helpers/mock-api"

test.describe("Admin Detail Pages", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" })

  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page)
  })

  // ═══════════════════════════════════════
  // USER DETAIL — /admin/users/[userId]
  // ═══════════════════════════════════════
  test.describe("/admin/users/[userId]", () => {
    test("detail page loads", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      // Mock specific user detail
      await page.route("**/api/admin/users/test-user-1", (route) =>
        route.fulfill({
          json: {
            data: {
              id: "test-user-1",
              name: "Test User",
              email: "test@test.com",
              role: "admin",
              email_verified: true,
              inserted_at: "2024-01-01T00:00:00Z",
            },
          },
        })
      )

      await assertPageLoads(page, "/admin/users/test-user-1")
      errors.assertNoJSErrors()
    })

    test("invalid userId — does not crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/admin/users/nonexistent-999", (route) =>
        route.fulfill({ status: 404, json: { error: "Not found" } })
      )

      await page.goto("/admin/users/nonexistent-999")
      await page.waitForLoadState("domcontentloaded")
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // USER FORMS
  // ═══════════════════════════════════════
  test("/admin/users/new — form renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(page, "/admin/users/new")
    await expect(page.locator("form")).toBeVisible()
    errors.assertNoJSErrors()
  })

  // ═══════════════════════════════════════
  // CARD DETAIL — /admin/cards/[cardId]
  // ═══════════════════════════════════════
  test.describe("/admin/cards/[cardId]", () => {
    test("detail page loads", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/admin/cards/test-card-1", (route) =>
        route.fulfill({
          json: {
            data: {
              id: "test-card-1",
              public_key: "test-card-1",
              user: { id: 1, name: "Test", email: "t@t.com" },
              fields: [],
              inserted_at: "2024-01-01T00:00:00Z",
            },
          },
        })
      )

      await assertPageLoads(page, "/admin/cards/test-card-1")
      errors.assertNoJSErrors()
    })

    test("invalid cardId — does not crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/admin/cards/nonexistent-card", (route) =>
        route.fulfill({ status: 404, json: { error: "Not found" } })
      )

      await page.goto("/admin/cards/nonexistent-card")
      await page.waitForLoadState("domcontentloaded")
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // CARD BULK IMPORT
  // ═══════════════════════════════════════
  test("/admin/cards/bulk-import — renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(page, "/admin/cards/bulk-import")
    errors.assertNoJSErrors()
  })

  // ═══════════════════════════════════════
  // COMPANY DETAIL — /admin/companies/[companyId]
  // Tabs: Cards, Users, Features
  // ═══════════════════════════════════════
  test.describe("/admin/companies/[companyId]", () => {
    test.beforeEach(async ({ page }) => {
      await page.route("**/api/admin/companies/test-co-1", (route) =>
        route.fulfill({
          json: {
            data: {
              id: "test-co-1",
              name: "Test Company",
              inserted_at: "2024-01-01T00:00:00Z",
            },
          },
        })
      )
      await page.route("**/api/admin/companies/test-co-1/cards**", (route) =>
        route.fulfill({ json: { data: [], total: 0 } })
      )
      await page.route("**/api/admin/companies/test-co-1/users**", (route) =>
        route.fulfill({ json: { data: [], total: 0 } })
      )
      await page.route("**/api/admin/companies/test-co-1/features**", (route) =>
        route.fulfill({ json: { data: { features: {} } } })
      )
    })

    test("detail page loads", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/companies/test-co-1")
      errors.assertNoJSErrors()
    })

    test("cards tab — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/companies/test-co-1")
      const cardsTab = page.locator(
        'button:has-text("Cards"), [role="tab"]:has-text("Cards")'
      )
      if ((await cardsTab.count()) > 0) {
        await cardsTab.first().click()
        await page.waitForTimeout(1000)
      }
      errors.assertNoJSErrors()
    })

    test("users tab — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/companies/test-co-1")
      const usersTab = page.locator(
        'button:has-text("Users"), [role="tab"]:has-text("Users")'
      )
      if ((await usersTab.count()) > 0) {
        await usersTab.first().click()
        await page.waitForTimeout(1000)
      }
      errors.assertNoJSErrors()
    })

    test("features tab — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await assertPageLoads(page, "/admin/companies/test-co-1")
      const featuresTab = page.locator(
        'button:has-text("Features"), [role="tab"]:has-text("Features")'
      )
      if ((await featuresTab.count()) > 0) {
        await featuresTab.first().click()
        await page.waitForTimeout(1000)
      }
      errors.assertNoJSErrors()
    })

    test("invalid companyId — does not crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.route("**/api/admin/companies/nonexistent-999", (route) =>
        route.fulfill({ status: 404, json: { error: "Not found" } })
      )

      await page.goto("/admin/companies/nonexistent-999")
      await page.waitForLoadState("domcontentloaded")
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // COMPANY FORMS
  // ═══════════════════════════════════════
  test("/admin/companies/new — form renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(page, "/admin/companies/new")
    await expect(page.locator("form")).toBeVisible()
    errors.assertNoJSErrors()
  })

  // ═══════════════════════════════════════
  // AD SYNC DETAIL — /admin/ad-sync/[connectionId]
  // Tabs: Sync Logs, Linked Users, Group Mappings, SSO, SCIM
  // ═══════════════════════════════════════
  test.describe("/admin/ad-sync/[connectionId]", () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        "**/api/admin/ad-sync/connections/test-conn-1",
        (route) => {
          if (route.request().method() === "GET") {
            return route.fulfill({
              json: {
                data: {
                  id: "test-conn-1",
                  name: "Test AD Connection",
                  status: "active",
                  inserted_at: "2024-01-01T00:00:00Z",
                },
              },
            })
          }
          return route.fulfill({ json: { data: {} } })
        }
      )
    })

    test("detail page loads", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.goto("/admin/ad-sync/test-conn-1")
      await page.waitForLoadState("domcontentloaded")
      errors.assertNoJSErrors()
    })

    test("all tabs — no crash", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.goto("/admin/ad-sync/test-conn-1")
      await page.waitForLoadState("domcontentloaded")

      const tabNames = [
        "Sync Logs",
        "Linked Users",
        "Group Mappings",
        "SSO",
        "SCIM",
      ]
      for (const tabName of tabNames) {
        const tab = page.locator(`[role="tab"]:has-text("${tabName}")`)
        if ((await tab.count()) > 0) {
          await tab.first().click()
          await page.waitForTimeout(1000)
        }
      }
      errors.assertNoJSErrors()
    })

    test("sync logs tab pagination", async ({ page }) => {
      const errors = new PageErrorCollector()
      errors.attach(page)

      await page.goto("/admin/ad-sync/test-conn-1")
      await page.waitForLoadState("domcontentloaded")

      const logsTab = page.locator('[role="tab"]:has-text("Sync Logs")')
      if ((await logsTab.count()) > 0) {
        await logsTab.first().click()
        await page.waitForTimeout(1000)
        await assertPaginationWorks(page)
      }
      errors.assertNoJSErrors()
    })
  })

  // ═══════════════════════════════════════
  // AD SYNC LOG DETAIL
  // ═══════════════════════════════════════
  test("ad-sync log detail — renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await page.route(
      "**/api/admin/ad-sync/connections/test-conn-1/logs/test-log-1",
      (route) =>
        route.fulfill({
          json: {
            data: {
              id: "test-log-1",
              status: "completed",
              type: "manual",
              triggered_by: "admin",
              duration_seconds: 30,
              inserted_at: "2024-01-01T00:00:00Z",
              stats: {
                users_created: 0,
                users_updated: 0,
                users_deactivated: 0,
                users_skipped: 0,
                users_errored: 0,
              },
              field_changes: [],
            },
          },
        })
    )

    await page.goto("/admin/ad-sync/test-conn-1/logs/test-log-1")
    await page.waitForLoadState("domcontentloaded")
    errors.assertNoJSErrors()
  })
})
