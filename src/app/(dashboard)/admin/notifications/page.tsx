"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { SendNotificationForm } from "@/components/admin/notifications/send-notification-form"
import { NotificationLogsTable } from "@/components/admin/notifications/notification-logs-table"
import { DeviceManagementTable } from "@/components/admin/notifications/device-management-table"
import { CleanupButton } from "@/components/admin/notifications/cleanup-button"
import { useTranslation } from "@/lib/i18n/context"

export default function AdminNotificationsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <AdminPageHeader title={t("adminNotifications")} />
        <CleanupButton />
      </div>

      <Tabs defaultValue="send">
        <TabsList>
          <TabsTrigger value="send">{t("sendNotification")}</TabsTrigger>
          <TabsTrigger value="logs">{t("notificationLogs")}</TabsTrigger>
          <TabsTrigger value="devices">{t("deviceManagement")}</TabsTrigger>
        </TabsList>
        <TabsContent value="send" className="mt-4">
          <SendNotificationForm />
        </TabsContent>
        <TabsContent value="logs" className="mt-4">
          <NotificationLogsTable />
        </TabsContent>
        <TabsContent value="devices" className="mt-4">
          <DeviceManagementTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
