"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import { format } from "date-fns"
import type { ADSyncLogDetail } from "@/lib/admin/types"

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  success: "default",
  partial: "secondary",
  failed: "destructive",
  running: "secondary",
}

export default function SyncLogDetailPage() {
  const { t } = useTranslation()
  const params = useParams<{ connectionId: string; logId: string }>()
  const [data, setData] = useState<ADSyncLogDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await apiClient.get<{ data: ADSyncLogDetail }>(
          `/api/admin/ad-sync/connections/${params.connectionId}/logs/${params.logId}`
        )
        setData(res.data)
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [params.connectionId, params.logId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("noResults")}
      </div>
    )
  }

  const { log, field_changes } = data

  function formatDuration(ms: number | null) {
    if (!ms) return "-"
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`${t("syncLogDetail")} #${log.id}`}
        backHref={`/admin/ad-sync/${params.connectionId}`}
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">{t("status")}</div>
            <Badge
              variant={statusVariant[log.status] || "outline"}
              className="mt-2"
            >
              {log.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              {t("syncType")}
            </div>
            <div className="text-lg font-semibold mt-1">{log.sync_type}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              {t("triggeredBy")}
            </div>
            <div className="text-lg font-semibold mt-1">
              {log.triggered_by}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              {t("syncLogDuration")}
            </div>
            <div className="text-lg font-semibold mt-1">
              {formatDuration(log.duration_ms)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              {t("syncLogStarted")}
            </div>
            <div className="text-sm font-medium mt-1">
              {format(new Date(log.started_at), "dd.MM.yyyy HH:mm:ss")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {log.users_created}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("usersCreated")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {log.users_updated}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("usersUpdated")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-red-600">
              {log.users_deactivated}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("usersDeactivated")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {log.users_skipped}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("usersSkipped")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {log.users_errored}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("usersErrored")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error message */}
      {log.error_message && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive text-sm">
              {t("syncLogErrorMessage")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap font-mono bg-muted p-3 rounded">
              {log.error_message}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Field Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t("fieldChanges")}</CardTitle>
        </CardHeader>
        <CardContent>
          {!field_changes || field_changes.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {t("noFieldChanges")}
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">
                      {t("fieldName")}
                    </th>
                    <th className="text-left p-3 font-medium">
                      {t("oldValue")}
                    </th>
                    <th className="text-left p-3 font-medium">
                      {t("newValue")}
                    </th>
                    <th className="text-left p-3 font-medium">
                      {t("changeSource")}
                    </th>
                    <th className="text-left p-3 font-medium">
                      {t("applied")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {field_changes.map((change) => (
                    <tr key={change.id} className="border-b">
                      <td className="p-3 font-medium">{change.field_name}</td>
                      <td className="p-3 text-muted-foreground">
                        {change.old_value || "-"}
                      </td>
                      <td className="p-3">{change.new_value || "-"}</td>
                      <td className="p-3 text-muted-foreground">
                        {change.change_source}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={change.applied ? "default" : "secondary"}
                        >
                          {change.applied ? t("yes") : t("no")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
