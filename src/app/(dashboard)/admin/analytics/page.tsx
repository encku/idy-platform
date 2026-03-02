"use client"

import { useEffect, useState, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AnalyticsOverviewStats } from "@/components/admin/analytics/analytics-overview-stats"
import { AnalyticsCardTable } from "@/components/admin/analytics/analytics-card-table"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import type { AnalyticsOverview } from "@/lib/admin/types"

export default function AdminAnalyticsPage() {
  const { t } = useTranslation()
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOverview = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<{ data: AnalyticsOverview }>(
        "/api/admin/analytics/overview"
      )
      setOverview(res.data || (res as unknown as AnalyticsOverview))
    } catch {
      setOverview(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("adminAnalytics")} />

      {loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </>
      ) : overview ? (
        <>
          <AnalyticsOverviewStats data={overview} />
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("topCards")}</h3>
            <AnalyticsCardTable cards={overview.top_cards || []} />
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {t("noResults")}
        </div>
      )}
    </div>
  )
}
