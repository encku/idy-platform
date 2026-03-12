import type { Page } from "@playwright/test"

/**
 * Mock all API endpoints so E2E tests can run without a live backend.
 * Returns sensible empty/minimal data for each endpoint.
 */
export async function mockAllAPIs(page: Page) {
  // ── Auth endpoints ──
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      json: {
        authenticated: true,
        user: {
          id: 1,
          name: "Test Admin",
          email: "admin@test.com",
          email_verified: true,
        },
        role: "admin",
      },
    })
  )

  await page.route("**/api/auth/refresh", (route) =>
    route.fulfill({ json: { success: true } })
  )

  // ── User endpoints ──
  await page.route("**/api/user", (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({
        json: {
          data: {
            id: 1,
            name: "Test User",
            email: "test@test.com",
            email_verified: true,
          },
        },
      })
    }
    return route.continue()
  })

  await page.route("**/api/user/cards", (route) =>
    route.fulfill({ json: { data: [] } })
  )

  await page.route("**/api/user/features", (route) =>
    route.fulfill({
      json: {
        data: {
          is_premium: true,
          trial_ends_at: null,
          features: {},
        },
      },
    })
  )

  // ── Field types ──
  await page.route("**/api/field-types**", (route) =>
    route.fulfill({ json: { data: [] } })
  )

  // ── Admin paginated endpoints — empty list ──
  const paginatedEndpoints = [
    "**/api/admin/users**",
    "**/api/admin/cards**",
    "**/api/admin/companies**",
    "**/api/admin/subscriptions**",
    "**/api/admin/notifications/**",
    "**/api/admin/ad-sync/**",
    "**/api/admin/field-types**",
  ]

  for (const pattern of paginatedEndpoints) {
    await page.route(pattern, (route) => {
      if (route.request().method() === "GET") {
        return route.fulfill({
          json: { data: [], total: 0 },
        })
      }
      return route.fulfill({ json: { data: {} } })
    })
  }

  // ── Admin dashboard endpoints ──
  await page.route("**/api/admin/dashboard/summary", (route) =>
    route.fulfill({
      json: {
        data: {
          total_users: 0,
          total_cards: 0,
          total_companies: 0,
          total_views: 0,
        },
      },
    })
  )

  await page.route("**/api/admin/dashboard/trends", (route) =>
    route.fulfill({ json: { data: {} } })
  )

  await page.route("**/api/admin/dashboard/weekly-stats", (route) =>
    route.fulfill({ json: { data: [] } })
  )

  await page.route("**/api/admin/dashboard/card-performance", (route) =>
    route.fulfill({ json: { data: [] } })
  )

  await page.route("**/api/admin/dashboard/recent-activities", (route) =>
    route.fulfill({ json: { activities: [] } })
  )

  // ── Admin analytics endpoints ──
  await page.route("**/api/admin/analytics/overview", (route) =>
    route.fulfill({
      json: { data: { top_cards: [] } },
    })
  )

  await page.route("**/api/admin/analytics/cards/*/summary", (route) =>
    route.fulfill({
      json: { data: { views: 0, clicks: 0, shares: 0 } },
    })
  )

  await page.route("**/api/admin/analytics/cards/*/by-date**", (route) =>
    route.fulfill({ json: { data: [] } })
  )

  await page.route("**/api/admin/analytics/cards/*/field-clicks**", (route) =>
    route.fulfill({ json: { data: [] } })
  )

  await page.route("**/api/admin/analytics/cards/*/share-methods**", (route) =>
    route.fulfill({ json: { data: [] } })
  )

  // ── Admin subscription stats ──
  await page.route("**/api/admin/subscriptions/stats", (route) =>
    route.fulfill({
      json: {
        data: {
          totalPremium: 0,
          activeMonthly: 0,
          activeYearly: 0,
          churnRate: 0,
          expiredCount: 0,
          monthlyMRR: 0,
          yearlyARR: 0,
        },
      },
    })
  )

  // ── User analytics endpoints ──
  await page.route("**/api/analytics/cards/*/summary**", (route) =>
    route.fulfill({
      json: { data: { views: 0, clicks: 0, shares: 0 } },
    })
  )

  await page.route("**/api/analytics/cards/*/by-date**", (route) =>
    route.fulfill({ json: { data: [] } })
  )

  await page.route("**/api/analytics/cards/*/field-clicks**", (route) =>
    route.fulfill({ json: { data: [] } })
  )

  await page.route("**/api/analytics/cards/*/share-methods**", (route) =>
    route.fulfill({ json: { data: [] } })
  )

  // ── SSO check ──
  await page.route("**/api/auth/sso/check**", (route) =>
    route.fulfill({ json: { sso_enabled: false } })
  )

  // ── Card endpoints ──
  await page.route("**/api/cards/**", (route) =>
    route.fulfill({ json: { data: { fields: [] } } })
  )

  // ── Card profile ──
  await page.route("**/api/user/card-profile/**", (route) =>
    route.fulfill({ json: { data: {} } })
  )

  // ── Admin card content ──
  await page.route("**/api/admin/cards/content**", (route) =>
    route.fulfill({ json: { data: [] } })
  )

  // ── Company features ──
  await page.route("**/api/admin/companies/my-features", (route) =>
    route.fulfill({ json: { data: { features: {} } } })
  )
}
