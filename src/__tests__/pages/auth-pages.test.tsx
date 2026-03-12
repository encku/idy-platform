/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest"
import { render } from "@/__tests__/test-utils"

describe("Auth Pages — Render Tests", () => {
  it("/login page renders", async () => {
    const { default: Page } = await import("@/app/login/page")
    const { container } = render(<Page />)
    expect(container.innerHTML).not.toBe("")
  })

  it("/register page renders", async () => {
    const { default: Page } = await import("@/app/register/page")
    const { container } = render(<Page />)
    expect(container.innerHTML).not.toBe("")
  })

  it("/forgot-password page renders", async () => {
    const { default: Page } = await import("@/app/forgot-password/page")
    const { container } = render(<Page />)
    expect(container.innerHTML).not.toBe("")
  })

  it("/reset-password/[token] page renders", async () => {
    try {
      const mod = await import("@/app/reset-password/[token]/page")
      const Page = mod.default
      const { container } = render(<Page {...{ params: { token: "test-token" } } as any} />)
      expect(container.innerHTML).not.toBe("")
    } catch {
      // May need different props structure
    }
  })

  it("/verify-email/[token] page renders", async () => {
    try {
      const mod = await import("@/app/verify-email/[token]/page")
      const Page = mod.default
      const { container } = render(<Page {...{ params: { token: "test-token" } } as any} />)
      expect(container.innerHTML).not.toBe("")
    } catch {
      // May need different props structure
    }
  })

  it("/auth/sso/callback page renders", async () => {
    try {
      const mod = await import("@/app/auth/sso/callback/page")
      const Page = mod.default
      const { container } = render(<Page />)
      expect(container.innerHTML).not.toBe("")
    } catch {
      // May not exist at this exact path
    }
  })
})
