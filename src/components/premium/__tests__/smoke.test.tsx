import { describe, it, expect, vi } from "vitest"
import { render } from "@/__tests__/test-utils"

describe("Premium Components — Smoke Tests", () => {
  it("PremiumBadge renders", async () => {
    const { PremiumBadge } = await import(
      "@/components/premium/premium-badge"
    )
    const { container } = render(<PremiumBadge />)
    expect(container.innerHTML).not.toBe("")
  })

  it("PremiumBadge small size", async () => {
    const { PremiumBadge } = await import(
      "@/components/premium/premium-badge"
    )
    const { container } = render(<PremiumBadge size="sm" />)
    expect(container.innerHTML).not.toBe("")
  })

  it("UpgradeDialog renders closed", async () => {
    const { UpgradeDialog } = await import(
      "@/components/premium/upgrade-dialog"
    )
    const { container } = render(
      <UpgradeDialog open={false} onOpenChange={vi.fn()} />
    )
    expect(container).toBeTruthy()
  })

  it("UpgradeDialog renders open", async () => {
    const { UpgradeDialog } = await import(
      "@/components/premium/upgrade-dialog"
    )
    render(<UpgradeDialog open={true} onOpenChange={vi.fn()} />)
    // Portal-based (Dialog) — renders in document.body
    expect(document.body.innerHTML).not.toBe("")
  })
})
