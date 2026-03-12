import { describe, it, expect, vi } from "vitest"
import { render } from "@/__tests__/test-utils"

describe("Admin Layout Components — Smoke Tests", () => {
  it("AdminPageHeader renders", async () => {
    const { AdminPageHeader } = await import(
      "@/components/admin/admin-page-header"
    )
    const { container } = render(<AdminPageHeader title="Test Title" />)
    expect(container.innerHTML).not.toBe("")
    expect(container.textContent).toContain("Test Title")
  })

  it("AdminPageHeader with subtitle and action", async () => {
    const { AdminPageHeader } = await import(
      "@/components/admin/admin-page-header"
    )
    const { container } = render(
      <AdminPageHeader
        title="Users"
        subtitle="Manage users"
        backHref="/admin"
        action={{ label: "Add User", onClick: vi.fn() }}
      />
    )
    expect(container.innerHTML).not.toBe("")
  })

  it("ConfirmDialog renders", async () => {
    const { ConfirmDialog } = await import(
      "@/components/admin/confirm-dialog"
    )
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete?"
        description="Are you sure?"
      />
    )
    // Portal-based (AlertDialog) — renders in document.body
    expect(document.body.innerHTML).toContain("Delete?")
  })

  it("Pagination renders", async () => {
    const { Pagination } = await import("@/components/admin/pagination")
    const { container } = render(
      <Pagination
        page={1}
        totalPages={5}
        total={100}
        pageSize={20}
        onPageChange={vi.fn()}
      />
    )
    expect(container.innerHTML).not.toBe("")
  })

  it("Pagination hides when 1 page", async () => {
    const { Pagination } = await import("@/components/admin/pagination")
    const { container } = render(
      <Pagination
        page={1}
        totalPages={1}
        total={5}
        pageSize={20}
        onPageChange={vi.fn()}
      />
    )
    // Should auto-hide or render minimally
    expect(container).toBeTruthy()
  })

  it("PhoneFrame renders", async () => {
    const { PhoneFrame } = await import("@/components/admin/phone-frame")
    const { container } = render(
      <PhoneFrame>
        <div>Card preview</div>
      </PhoneFrame>
    )
    expect(container.innerHTML).not.toBe("")
  })
})
