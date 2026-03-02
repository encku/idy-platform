"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MousePointerClick, Share2, CreditCard } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import type { AnalyticsOverview } from "@/lib/admin/types"

interface AnalyticsOverviewStatsProps {
  data: AnalyticsOverview
}

export function AnalyticsOverviewStats({ data }: AnalyticsOverviewStatsProps) {
  const { t } = useTranslation()

  const stats = [
    { label: t("totalViews"), value: data.total_views, icon: <Eye className="size-4" /> },
    { label: t("totalClicks"), value: data.total_clicks, icon: <MousePointerClick className="size-4" /> },
    { label: t("totalShares"), value: data.total_shares, icon: <Share2 className="size-4" /> },
    { label: t("totalCards"), value: data.total_cards, icon: <CreditCard className="size-4" /> },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <div className="text-muted-foreground">{stat.icon}</div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
