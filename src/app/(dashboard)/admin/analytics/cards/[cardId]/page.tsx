"use client"

import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { useParams } from "next/navigation"
import { format, subDays } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { DateRangePicker } from "@/components/admin/analytics/date-range-picker"
import { ExportButton } from "@/components/admin/analytics/export-button"

const ViewsOverTimeChart = dynamic(
  () => import("@/components/admin/analytics/views-over-time-chart").then((m) => ({ default: m.ViewsOverTimeChart })),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-lg" /> }
)
const FieldClicksChart = dynamic(
  () => import("@/components/admin/analytics/field-clicks-chart").then((m) => ({ default: m.FieldClicksChart })),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-lg" /> }
)
const ShareMethodsChart = dynamic(
  () => import("@/components/admin/analytics/share-methods-chart").then((m) => ({ default: m.ShareMethodsChart })),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full rounded-lg" /> }
)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MousePointerClick, Share2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import type {
  CardAnalyticsSummary,
  CardAnalyticsByDate,
  FieldClickStat,
  ShareMethodStat,
} from "@/lib/admin/types"

export default function CardAnalyticsDetailPage() {
  const { t } = useTranslation()
  const params = useParams<{ cardId: string }>()
  const [summary, setSummary] = useState<CardAnalyticsSummary | null>(null)
  const [byDate, setByDate] = useState<CardAnalyticsByDate[]>([])
  const [fieldClicks, setFieldClicks] = useState<FieldClickStat[]>([])
  const [shareMethods, setShareMethods] = useState<ShareMethodStat[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const dateParams = new URLSearchParams()
      if (startDate) dateParams.set("start_date", format(startDate, "yyyy-MM-dd"))
      if (endDate) dateParams.set("end_date", format(endDate, "yyyy-MM-dd"))
      const qs = dateParams.toString()

      const [summaryRes, dateRes, clicksRes, shareRes] = await Promise.allSettled([
        apiClient.get<{ data: CardAnalyticsSummary }>(
          `/api/admin/analytics/cards/${params.cardId}/summary`
        ),
        apiClient.get<{ data: CardAnalyticsByDate[] }>(
          `/api/admin/analytics/cards/${params.cardId}/by-date${qs ? `?${qs}` : ""}`
        ),
        apiClient.get<{ data: FieldClickStat[] }>(
          `/api/admin/analytics/cards/${params.cardId}/field-clicks`
        ),
        apiClient.get<{ data: ShareMethodStat[] }>(
          `/api/admin/analytics/cards/${params.cardId}/share-methods`
        ),
      ])

      if (summaryRes.status === "fulfilled") setSummary(summaryRes.value.data)
      if (dateRes.status === "fulfilled") setByDate(dateRes.value.data || [])
      if (clicksRes.status === "fulfilled") setFieldClicks(clicksRes.value.data || [])
      if (shareRes.status === "fulfilled") setShareMethods(shareRes.value.data || [])
    } catch {
      // handled per-request above
    } finally {
      setLoading(false)
    }
  }, [params.cardId, startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const summaryStats = summary
    ? [
        { label: t("totalViews"), value: summary.total_views, icon: <Eye className="size-4" /> },
        { label: t("totalClicks"), value: summary.total_field_clicks, icon: <MousePointerClick className="size-4" /> },
        { label: t("totalShares"), value: summary.total_shares, icon: <Share2 className="size-4" /> },
      ]
    : []

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("cardAnalytics")}
        backHref="/admin/analytics"
      />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
        <ExportButton cardId={params.cardId} />
      </div>

      {loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-lg" />
        </>
      ) : (
        <>
          {summary && (
            <div className="grid gap-4 sm:grid-cols-3">
              {summaryStats.map((stat) => (
                <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <div className="text-muted-foreground">{stat.icon}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {stat.value.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {byDate.length > 0 && <ViewsOverTimeChart data={byDate} />}

          <div className="grid gap-6 lg:grid-cols-2">
            {fieldClicks.length > 0 && <FieldClicksChart data={fieldClicks} />}
            {shareMethods.length > 0 && <ShareMethodsChart data={shareMethods} />}
          </div>
        </>
      )}
    </div>
  )
}
