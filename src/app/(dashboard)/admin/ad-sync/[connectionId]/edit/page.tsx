"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ConnectionForm } from "@/components/admin/ad-sync/connection-form"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import type { ADConnectionDetail } from "@/lib/admin/types"

export default function EditConnectionPage() {
  const { t } = useTranslation()
  const params = useParams<{ connectionId: string }>()
  const [connection, setConnection] = useState<ADConnectionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get<{ data: ADConnectionDetail }>(
        `/api/admin/ad-sync/connections/${params.connectionId}`
      )
      .then((res) => setConnection(res.data))
      .finally(() => setLoading(false))
  }, [params.connectionId])

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded" />
  }

  if (!connection) {
    return <div className="text-center py-12 text-muted-foreground">{t("noResults")}</div>
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("editConnection")}
        backHref={`/admin/ad-sync/${params.connectionId}`}
      />
      <ConnectionForm mode="edit" connection={connection} />
    </div>
  )
}
