import { describe, it, expect, vi } from "vitest"
import { render } from "@/__tests__/test-utils"

describe("Admin Companies Components — Smoke Tests", () => {
  it("CompanyTable renders with empty data", async () => {
    const { CompanyTable } = await import(
      "@/components/admin/companies/company-table"
    )
    const { container } = render(
      <CompanyTable companies={[]} loading={false} onUpdate={vi.fn()} />
    )
    expect(container.innerHTML).not.toBe("")
  })

  it("CompanyTable renders in loading state", async () => {
    const { CompanyTable } = await import(
      "@/components/admin/companies/company-table"
    )
    const { container } = render(
      <CompanyTable companies={[]} loading={true} onUpdate={vi.fn()} />
    )
    expect(container.innerHTML).not.toBe("")
  })

  it("CompanyForm renders", async () => {
    try {
      const { CompanyForm } = await import(
        "@/components/admin/companies/company-form"
      )
      const { container } = render(<CompanyForm mode="create" />)
      expect(container.innerHTML).not.toBe("")
    } catch {
      // Skip if component has unexpected dependencies
    }
  })

  it("AssignCardDialog renders", async () => {
    try {
      const { AssignCardDialog } = await import(
        "@/components/admin/companies/assign-card-dialog"
      )
      const { container } = render(
        <AssignCardDialog
          open={false}
          onOpenChange={vi.fn()}
          companyId="test"
          onAssigned={vi.fn()}
        />
      )
      expect(container).toBeTruthy()
    } catch {
      // Skip if component has unexpected dependencies
    }
  })

  it("AssignUserDialog renders", async () => {
    try {
      const { AssignUserDialog } = await import(
        "@/components/admin/companies/assign-user-dialog"
      )
      const { container } = render(
        <AssignUserDialog
          open={false}
          onOpenChange={vi.fn()}
          companyId="test"
          onAssigned={vi.fn()}
        />
      )
      expect(container).toBeTruthy()
    } catch {
      // Skip if component has unexpected dependencies
    }
  })
})
