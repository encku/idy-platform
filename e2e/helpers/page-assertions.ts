import { expect, type Page } from "@playwright/test"

/** Navigate to a page and assert it loads without error */
export async function assertPageLoads(page: Page, path: string) {
  const response = await page.goto(path)
  expect(response?.status(), `${path} returned HTTP error`).toBeLessThan(400)
  await page.waitForLoadState("domcontentloaded")

  const body = await page.locator("body").innerHTML()
  expect(body.length, `${path} body is empty`).toBeGreaterThan(50)

  // Check no error boundary was triggered
  const errorBoundary = page.locator("text=Something went wrong")
  const errorCount = await errorBoundary.count()
  expect(errorCount, `${path} shows error boundary`).toBe(0)
}

/** Assert pagination controls work */
export async function assertPaginationWorks(page: Page) {
  // Look for next button
  const nextBtn = page.locator(
    'button:has-text("Next"), button:has-text("Sonraki"), button[aria-label="Next"], button[aria-label="Go to next page"]'
  )

  if ((await nextBtn.count()) > 0 && (await nextBtn.isEnabled())) {
    await nextBtn.click()
    await page.waitForTimeout(800)
    // Page should still be intact — no crash
    const body = await page.locator("body").innerHTML()
    expect(body.length).toBeGreaterThan(50)
  }
}

/** Assert search input works */
export async function assertSearchWorks(
  page: Page,
  searchText: string
) {
  const searchInput = page.locator(
    'input[placeholder*="Search"], input[placeholder*="Ara"], input[placeholder*="search"], input[type="search"]'
  )

  if ((await searchInput.count()) > 0) {
    await searchInput.first().fill(searchText)
    // Wait for debounce (400ms) + network + render
    await page.waitForTimeout(800)
    // Page should not crash
    const body = await page.locator("body").innerHTML()
    expect(body.length).toBeGreaterThan(50)
  }
}

/** Fill search with nonsense and verify empty state doesn't crash */
export async function assertEmptyState(page: Page) {
  const searchInput = page.locator(
    'input[placeholder*="Search"], input[placeholder*="Ara"], input[placeholder*="search"], input[type="search"]'
  )

  if ((await searchInput.count()) > 0) {
    await searchInput.first().fill("zzznonexistent999xyz")
    await page.waitForTimeout(800)
    // Page should not crash even with no results
    const body = await page.locator("body").innerHTML()
    expect(body.length).toBeGreaterThan(50)
  }
}

/** Assert the page isn't stuck in a loading state after timeout */
export async function assertNoLoadingStuck(page: Page, timeoutMs = 5000) {
  await page.waitForTimeout(timeoutMs)
  // Check for spinning loaders — they should have resolved by now
  const spinners = page.locator('[class*="animate-spin"]')
  const spinnerCount = await spinners.count()
  // Allow at most 1 spinner (could be an intentional decorative element)
  expect(spinnerCount, "Page stuck in loading state").toBeLessThanOrEqual(1)
}
