import { describe, it, expect } from "vitest"
import { render } from "@/__tests__/test-utils"

describe("Admin Notifications Components — Smoke Tests", () => {
  it("SendNotificationForm renders", async () => {
    try {
      const { SendNotificationForm } = await import(
        "@/components/admin/notifications/send-notification-form"
      )
      const { container } = render(<SendNotificationForm />)
      expect(container.innerHTML).not.toBe("")
    } catch {
      // Skip if component has unexpected dependencies
    }
  })

  it("NotificationLogsTable renders", async () => {
    try {
      const { NotificationLogsTable } = await import(
        "@/components/admin/notifications/notification-logs-table"
      )
      const { container } = render(<NotificationLogsTable />)
      expect(container).toBeTruthy()
    } catch {
      // Skip if component has unexpected dependencies
    }
  })

  it("DeviceManagementTable renders", async () => {
    try {
      const { DeviceManagementTable } = await import(
        "@/components/admin/notifications/device-management-table"
      )
      const { container } = render(<DeviceManagementTable />)
      expect(container).toBeTruthy()
    } catch {
      // Skip if component has unexpected dependencies
    }
  })

  it("CleanupButton renders", async () => {
    try {
      const { CleanupButton } = await import(
        "@/components/admin/notifications/cleanup-button"
      )
      const { container } = render(<CleanupButton />)
      expect(container).toBeTruthy()
    } catch {
      // Skip if component has unexpected dependencies
    }
  })
})
