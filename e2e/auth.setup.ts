import { test as setup } from "@playwright/test"
import { mockAllAPIs } from "./helpers/mock-api"

/**
 * Auth setup — creates storage state files that other tests use
 * to skip login on every test.
 *
 * If TEST_USER_EMAIL / TEST_ADMIN_EMAIL are set and a real backend
 * is running, it will log in via the real login form.
 * Otherwise it uses API mocking to simulate authenticated state.
 */

setup("authenticate as user", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD

  if (email && password && process.env.BASE_URL) {
    // Real login flow
    try {
      await page.goto("/login")
      await page.fill('input[name="email"], input[type="email"]', email)
      await page.fill('input[type="password"]', password)
      await page.click('button[type="submit"]')
      await page.waitForURL("/", { timeout: 10_000 })
    } catch {
      // Fallback to mock if real login fails
      await mockAllAPIs(page)
      await page.goto("/")
    }
  } else {
    // Mock login
    await mockAllAPIs(page)
    await page.goto("/")
  }

  await page.context().storageState({ path: "./e2e/.auth/user.json" })
})

setup("authenticate as admin", async ({ page }) => {
  const email = process.env.TEST_ADMIN_EMAIL
  const password = process.env.TEST_ADMIN_PASSWORD

  if (email && password && process.env.BASE_URL) {
    try {
      await page.goto("/login")
      await page.fill('input[name="email"], input[type="email"]', email)
      await page.fill('input[type="password"]', password)
      await page.click('button[type="submit"]')
      await page.waitForURL("/", { timeout: 10_000 })
    } catch {
      await mockAllAPIs(page)
      await page.goto("/")
    }
  } else {
    await mockAllAPIs(page)
    await page.goto("/")
  }

  await page.context().storageState({ path: "./e2e/.auth/admin.json" })
})
