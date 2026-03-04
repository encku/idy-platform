"use client"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ConnectionForm } from "@/components/admin/ad-sync/connection-form"
import { useTranslation } from "@/lib/i18n/context"

export default function NewConnectionPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("addConnection")} backHref="/admin/ad-sync" />
      <ConnectionForm mode="create" />
    </div>
  )
}
