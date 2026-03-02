"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, CreditCard, Table2, ShoppingCart, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatsCardWithTrend } from "@/components/admin/dashboard/stats-card-with-trend"
import { WeeklyViewsChart } from "@/components/admin/dashboard/weekly-views-chart"
import { CardPerformanceChart } from "@/components/admin/dashboard/card-performance-chart"
import { RecentActivityTimeline } from "@/components/admin/dashboard/recent-activity-timeline"
import { apiClient } from "@/lib/api-client"
import { useTranslation } from "@/lib/i18n/context"
import type {
  DashboardSummary,
  DashboardTrends,
  WeeklyStat,
  CardPerformance,
  RecentActivity,
} from "@/lib/admin/types"

/** Extract an array from an API response that may be wrapped (e.g. { data: [...] }) */
function toArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val
  if (val && typeof val === "object" && Array.isArray((val as any).data)) return (val as any).data
  return []
}

export default function AdminDashboardPage() {
  const { t } = useTranslation()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [trends, setTrends] = useState<DashboardTrends | null>(null)
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([])
  const [cardPerformance, setCardPerformance] = useState<CardPerformance[]>([])
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const results = await Promise.allSettled([
          apiClient.get<{ data: DashboardSummary }>("/api/admin/dashboard/summary"),
          apiClient.get<{ data: DashboardTrends }>("/api/admin/dashboard/trends"),
          apiClient.get<{ data: WeeklyStat[] }>("/api/admin/dashboard/weekly-stats"),
          apiClient.get<{ data: CardPerformance[] }>("/api/admin/dashboard/card-performance"),
          apiClient.get<{ data: RecentActivity[] }>("/api/admin/dashboard/recent-activities"),
        ])

        if (results[0].status === "fulfilled") setSummary(results[0].value.data)
        if (results[1].status === "fulfilled") setTrends(results[1].value.data)
        if (results[2].status === "fulfilled") setWeeklyStats(toArray(results[2].value.data))
        if (results[3].status === "fulfilled") setCardPerformance(toArray(results[3].value.data))
        if (results[4].status === "fulfilled") setActivities(toArray(results[4].value.data))
      } catch {
        // individual failures handled by allSettled
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const quickActions = [
    {
      href: "/admin/users",
      icon: Users,
      label: t("adminUsers"),
      description: t("adminUsersDesc"),
    },
    {
      href: "/admin/cards",
      icon: CreditCard,
      label: t("adminCards"),
      description: t("adminCardsDesc"),
    },
    {
      href: "/admin/card-content",
      icon: Table2,
      label: t("adminCardContent"),
      description: t("adminCardContentDesc"),
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("adminDashboard")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("adminDashboardSubtitle")}
        </p>
      </div>

      {/* Stats with trends */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCardWithTrend
            title={t("userCount")}
            value={summary?.user_count ?? 0}
            icon={<Users className="size-4" />}
            trend={trends?.user_count}
            vsLabel={t("vsLastPeriod")}
          />
          <StatsCardWithTrend
            title={t("activeTagCount")}
            value={summary?.active_tag_count ?? 0}
            icon={<CreditCard className="size-4" />}
            trend={trends?.active_tag_count}
            vsLabel={t("vsLastPeriod")}
          />
          <StatsCardWithTrend
            title={t("orderCount")}
            value={summary?.order_count ?? 0}
            icon={<ShoppingCart className="size-4" />}
            trend={trends?.order_count}
            vsLabel={t("vsLastPeriod")}
          />
          <StatsCardWithTrend
            title={t("totalViews")}
            value={summary?.total_views ?? 0}
            icon={<Eye className="size-4" />}
            trend={trends?.total_views}
            vsLabel={t("vsLastPeriod")}
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyViewsChart
          data={weeklyStats}
          title={t("weeklyViewsTrend")}
          loading={loading}
        />
        <CardPerformanceChart
          data={cardPerformance}
          title={t("cardPerformance")}
          loading={loading}
        />
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <RecentActivityTimeline
          activities={activities}
          title={t("recentActivity")}
          loading={loading}
        />

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t("quickActions")}</h2>
          <div className="grid gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <action.icon className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
