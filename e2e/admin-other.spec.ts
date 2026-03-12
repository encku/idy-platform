import { test } from "@playwright/test"
import { PageErrorCollector } from "./helpers/error-collector"
import { assertPageLoads } from "./helpers/page-assertions"
import { mockAllAPIs } from "./helpers/mock-api"

test.describe("Admin Other Pages", () => {
  test.use({ storageState: "./e2e/.auth/admin.json" })

  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page)
  })

  // NOTIFICATIONS
  test("/admin/notifications — renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(page, "/admin/notifications")
    errors.assertNoJSErrors()
  })

  // FIELD TYPES — non-paginated, grouped
  test("/admin/field-types — renders groups", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await page.route("**/api/admin/field-types/groups**", (route) =>
      route.fulfill({
        json: {
          data: [
            {
              group: "contact",
              field_types: [
                { id: "1", name: "Email", icon: "mail", group: "contact" },
                { id: "2", name: "Phone", icon: "phone", group: "contact" },
              ],
            },
          ],
        },
      })
    )

    await assertPageLoads(page, "/admin/field-types")
    await page.waitForTimeout(2000)
    errors.assertNoJSErrors()
  })

  // CARD CONTENT — spreadsheet editor
  test("/admin/card-content — spreadsheet renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(page, "/admin/card-content")
    errors.assertNoJSErrors()
  })

  // CARD REDIRECTS
  test("/admin/cards/[cardId]/redirects — renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await page.goto("/admin/cards/test-card-1/redirects")
    await page.waitForLoadState("domcontentloaded")
    errors.assertNoJSErrors()
  })

  // AD SYNC FORMS
  test("/admin/ad-sync/new — form renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await page.goto("/admin/ad-sync/new")
    await page.waitForLoadState("domcontentloaded")
    errors.assertNoJSErrors()
  })

  // AD SYNC FIELD MAPPINGS
  test("/admin/ad-sync/[connectionId]/mappings — renders", async ({
    page,
  }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await page.route(
      "**/api/admin/ad-sync/connections/test-conn-1/mappings**",
      (route) => route.fulfill({ json: { data: [] } })
    )

    await page.goto("/admin/ad-sync/test-conn-1/mappings")
    await page.waitForLoadState("domcontentloaded")
    errors.assertNoJSErrors()
  })

  // AD SYNC EDIT CONNECTION
  test("/admin/ad-sync/[connectionId]/edit — renders", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await page.route(
      "**/api/admin/ad-sync/connections/test-conn-1",
      (route) => {
        if (route.request().method() === "GET") {
          return route.fulfill({
            json: {
              data: {
                id: "test-conn-1",
                name: "Test Connection",
                host: "ldap.test.com",
                port: 389,
              },
            },
          })
        }
        return route.fulfill({ json: { data: {} } })
      }
    )

    await page.goto("/admin/ad-sync/test-conn-1/edit")
    await page.waitForLoadState("domcontentloaded")
    errors.assertNoJSErrors()
  })
})
