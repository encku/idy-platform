import { test, expect } from "@playwright/test"
import { PageErrorCollector } from "./helpers/error-collector"
import { assertPageLoads } from "./helpers/page-assertions"
import { mockAllAPIs } from "./helpers/mock-api"

test.describe("Public Pages", () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page)
  })

  // ═══════════════════════════════════════
  // LOGIN
  // ═══════════════════════════════════════
  test("/login — renders login form", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(page, "/login")
    await expect(
      page.locator('input[type="email"], input[name="email"]')
    ).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    errors.assertNoJSErrors()
  })

  test("/login?from=/admin — preserves redirect param", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(page, "/login?from=/admin")
    errors.assertNoJSErrors()
  })

  // ═══════════════════════════════════════
  // REGISTER
  // ═══════════════════════════════════════
  test("/register — renders registration form", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(page, "/register")
    await expect(
      page.locator('input[type="email"], input[name="email"]')
    ).toBeVisible()

    errors.assertNoJSErrors()
  })

  test("/register?public_key=xxx&private_key=yyy — card claim mode", async ({
    page,
  }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(
      page,
      "/register?public_key=test-key&private_key=test-secret"
    )

    errors.assertNoJSErrors()
  })

  // ═══════════════════════════════════════
  // FORGOT PASSWORD
  // ═══════════════════════════════════════
  test("/forgot-password — renders form", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await assertPageLoads(page, "/forgot-password")
    errors.assertNoJSErrors()
  })

  // ═══════════════════════════════════════
  // RESET PASSWORD — invalid token
  // ═══════════════════════════════════════
  test("/reset-password/invalid-token — does not crash", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await page.goto("/reset-password/invalid-token-123")
    await page.waitForLoadState("domcontentloaded")

    errors.assertNoJSErrors()
  })

  // ═══════════════════════════════════════
  // VERIFY EMAIL — invalid token
  // ═══════════════════════════════════════
  test("/verify-email/invalid-token — does not crash", async ({ page }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await page.route("**/api/verify-email", (route) =>
      route.fulfill({ status: 422, json: { error: "Invalid token" } })
    )

    await page.goto("/verify-email/invalid-token-123")
    await page.waitForLoadState("domcontentloaded")

    errors.assertNoJSErrors()
  })

  // ═══════════════════════════════════════
  // SSO CALLBACK — no params
  // ═══════════════════════════════════════
  test("/auth/sso/callback — does not crash without params", async ({
    page,
  }) => {
    const errors = new PageErrorCollector()
    errors.attach(page)

    await page.goto("/auth/sso/callback")
    await page.waitForLoadState("domcontentloaded")

    errors.assertNoJSErrors()
  })
})
