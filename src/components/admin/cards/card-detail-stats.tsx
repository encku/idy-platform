"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MousePointerClick, Share2 } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"

interface CardDetailStatsProps {
  views: number
  clicks: number
  shares: number
}

export function CardDetailStats({ views, clicks, shares }: CardDetailStatsProps) {
  const { t } = useTranslation()

  const stats = [
    { label: t("totalViews"), value: views, icon: <Eye className="size-4" /> },
    { label: t("totalClicks"), value: clicks, icon: <MousePointerClick className="size-4" /> },
    { label: t("totalShares"), value: shares, icon: <Share2 className="size-4" /> },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
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
