import { expect, type Page } from "@playwright/test"

/**
 * Intercepts and stores API responses for validation.
 */
export class APIInterceptor {
  responses: Map<string, { status: number; body: unknown }> = new Map()

  attach(page: Page) {
    page.on("response", async (response) => {
      const url = response.url()
      if (url.includes("/api/")) {
        try {
          const body = await response.json()
          this.responses.set(url, { status: response.status(), body })
        } catch {
          // Non-JSON response — skip
        }
      }
    })
  }

  /** Assert a paginated endpoint returns { data: T[], total: number } */
  assertPaginatedResponse(urlPattern: string) {
    for (const [url, { body }] of this.responses) {
      if (url.includes(urlPattern)) {
        const b = body as Record<string, unknown>
        expect(b, `${urlPattern} missing 'data' field`).toHaveProperty("data")
        expect(b, `${urlPattern} missing 'total' field`).toHaveProperty("total")
        expect(
          Array.isArray(b.data),
          `${urlPattern} 'data' is not an array`
        ).toBe(true)
        expect(
          typeof b.total,
          `${urlPattern} 'total' is not a number`
        ).toBe("number")
        return
      }
    }
  }

  /** Assert a single-item endpoint returns { data: T } */
  assertSingleResponse(urlPattern: string) {
    for (const [url, { body }] of this.responses) {
      if (url.includes(urlPattern)) {
        const b = body as Record<string, unknown>
        expect(b, `${urlPattern} missing 'data' field`).toHaveProperty("data")
        return
      }
    }
  }

  /** Get the response body for a URL pattern */
  getResponse(urlPattern: string): unknown | undefined {
    for (const [url, { body }] of this.responses) {
      if (url.includes(urlPattern)) {
        return body
      }
    }
    return undefined
  }

  reset() {
    this.responses.clear()
  }
}
