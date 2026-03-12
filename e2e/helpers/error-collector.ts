import { expect, type Page } from "@playwright/test"

/**
 * Collects JavaScript errors, console errors, and network errors during page navigation.
 * Attach to a page before navigation and call assertNoJSErrors() after.
 */
export class PageErrorCollector {
  jsErrors: string[] = []
  consoleErrors: string[] = []
  networkErrors: string[] = []
  failedRequests: string[] = []

  attach(page: Page) {
    // JavaScript runtime errors (uncaught exceptions, unhandled rejections)
    page.on("pageerror", (err) => {
      this.jsErrors.push(err.message)
    })

    // Console.error calls
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text()
        // Filter out known React/Next.js dev-mode warnings
        if (
          text.includes("Hydration") ||
          text.includes("Warning:") ||
          text.includes("Download the React DevTools") ||
          text.includes("ReactDOM.render is no longer supported") ||
          text.includes("[Fast Refresh]")
        ) {
          return
        }
        this.consoleErrors.push(text)
      }
    })

    // HTTP 500+ errors
    page.on("response", (response) => {
      if (response.status() >= 500) {
        this.networkErrors.push(`${response.status()} ${response.url()}`)
      }
    })

    // Failed network requests (CORS, DNS, timeout etc.)
    page.on("requestfailed", (request) => {
      const url = request.url()
      // Ignore static assets
      if (
        url.includes("favicon") ||
        url.includes("_next/static") ||
        url.includes("_next/image") ||
        url.includes("chrome-extension")
      ) {
        return
      }
      this.failedRequests.push(`FAILED: ${request.method()} ${url}`)
    })
  }

  assertNoJSErrors() {
    expect(this.jsErrors, "JavaScript runtime errors found").toEqual([])
    expect(this.consoleErrors, "Console errors found").toEqual([])
  }

  assertNoNetworkErrors() {
    expect(this.networkErrors, "HTTP 500+ errors found").toEqual([])
  }

  reset() {
    this.jsErrors = []
    this.consoleErrors = []
    this.networkErrors = []
    this.failedRequests = []
  }
}
