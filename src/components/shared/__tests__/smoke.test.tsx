import { describe, it, expect, vi } from "vitest"
import { render } from "@/__tests__/test-utils"

describe("Shared Components — Smoke Tests", () => {
  it("LoadingSpinner renders", async () => {
    const { LoadingSpinner } = await import(
      "@/components/shared/loading-spinner"
    )
    const { container } = render(<LoadingSpinner />)
    expect(container.innerHTML).not.toBe("")
  })

  it("PullToRefresh renders", async () => {
    const { PullToRefresh } = await import(
      "@/components/shared/pull-to-refresh"
    )
    const { container } = render(
      <PullToRefresh onRefresh={vi.fn().mockResolvedValue(undefined)}>
        <div>Content</div>
      </PullToRefresh>
    )
    expect(container.innerHTML).not.toBe("")
  })
})
